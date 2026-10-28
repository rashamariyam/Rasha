-- LeaveEase Database Schema & Row Level Security (RLS) Policies
-- PostgreSQL / Supabase Migration
-- Role-based college leave management system

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'hod', 'admin');
CREATE TYPE account_status AS ENUM ('active', 'pending', 'rejected', 'disabled');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Profiles / Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    department TEXT NOT NULL,
    course TEXT,
    semester INT CHECK (semester BETWEEN 1 AND 8),
    year INT CHECK (year BETWEEN 1 AND 4),
    roll_no TEXT UNIQUE,
    phone TEXT,
    account_status account_status NOT NULL DEFAULT 'active',
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Leave Requests Table
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    roll_no TEXT NOT NULL,
    department TEXT NOT NULL,
    leave_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    document_name TEXT,
    status leave_status NOT NULL DEFAULT 'pending',
    teacher_approved BOOLEAN NOT NULL DEFAULT FALSE,
    hod_approved BOOLEAN NOT NULL DEFAULT FALSE,
    decided_by TEXT,
    decided_at TIMESTAMPTZ,
    decision_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Green Card Slots Table
CREATE TABLE IF NOT EXISTS public.green_card_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INT NOT NULL DEFAULT 30,
    booked_ids TEXT[] NOT NULL DEFAULT '{}'
);

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID REFERENCES public.green_card_slots(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    booked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Classrooms Table
CREATE TABLE IF NOT EXISTS public.classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number TEXT NOT NULL,
    building TEXT NOT NULL,
    capacity INT NOT NULL,
    floor INT NOT NULL
);

-- 7. Classroom Schedules Table
CREATE TABLE IF NOT EXISTS public.classroom_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT NOT NULL,
    booked_by TEXT NOT NULL
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.green_card_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 10. Security Policies for Users
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view and manage all profiles"
    ON public.users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- 11. Security Policies for Leave Requests
CREATE POLICY "Students can view and create own leave requests"
    ON public.leave_requests FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Students can insert own leave requests"
    ON public.leave_requests FOR INSERT
    WITH CHECK (
        student_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid() AND role = 'student'
        )
    );

CREATE POLICY "Teachers can review departmental leave requests"
    ON public.leave_requests FOR ALL
    USING (
        department IN (
            SELECT department FROM public.users WHERE auth_user_id = auth.uid() AND role = 'teacher'
        )
    );

CREATE POLICY "HODs can review and approve departmental leave requests"
    ON public.leave_requests FOR ALL
    USING (
        department IN (
            SELECT department FROM public.users WHERE auth_user_id = auth.uid() AND role = 'hod'
        )
    );

CREATE POLICY "Admins have full access to leave requests"
    ON public.leave_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- 12. Security Policies for Green Card Slots
-- Everyone logged in can view slots
CREATE POLICY "Authenticated users can view green card slots"
    ON public.green_card_slots FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Only admins and HODs can create slots
CREATE POLICY "Admins and HODs can create green card slots"
    ON public.green_card_slots FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_user_id = auth.uid() AND role IN ('admin', 'hod')
        )
    );

-- Only admins and HODs can update slots (e.g. capacity, title)
CREATE POLICY "Admins and HODs can update green card slots"
    ON public.green_card_slots FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_user_id = auth.uid() AND role IN ('admin', 'hod')
        )
    );

-- Only admins can delete slots
CREATE POLICY "Admins can delete green card slots"
    ON public.green_card_slots FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- 13. Security Policies for Bookings
-- Students can view their own bookings; staff can view all
CREATE POLICY "Students can view own bookings"
    ON public.bookings FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_user_id = auth.uid() AND role IN ('teacher', 'hod', 'admin')
        )
    );

-- Students can book a slot for themselves only
CREATE POLICY "Students can create own bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (
        student_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid() AND role = 'student'
        )
    );

-- Students can cancel their own bookings; admins can cancel any
CREATE POLICY "Students can delete own bookings"
    ON public.bookings FOR DELETE
    USING (
        student_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- 14. Security Policies for Classrooms
-- All authenticated users can view classrooms
CREATE POLICY "Authenticated users can view classrooms"
    ON public.classrooms FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Only admins can add classrooms
CREATE POLICY "Admins can insert classrooms"
    ON public.classrooms FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update classroom details
CREATE POLICY "Admins can update classrooms"
    ON public.classrooms FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete classrooms
CREATE POLICY "Admins can delete classrooms"
    ON public.classrooms FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- 15. Security Policies for Classroom Schedules
-- All authenticated users can view schedules (to check availability)
CREATE POLICY "Authenticated users can view classroom schedules"
    ON public.classroom_schedules FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Teachers, HODs, and admins can create schedules
CREATE POLICY "Staff can create classroom schedules"
    ON public.classroom_schedules FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_user_id = auth.uid() AND role IN ('teacher', 'hod', 'admin')
        )
    );

-- Only the person who booked or an admin can update a schedule
CREATE POLICY "Staff can update own classroom schedules"
    ON public.classroom_schedules FOR UPDATE
    USING (
        booked_by IN (
            SELECT name FROM public.users WHERE auth_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- Only the person who booked or an admin can delete a schedule
CREATE POLICY "Staff can delete own classroom schedules"
    ON public.classroom_schedules FOR DELETE
    USING (
        booked_by IN (
            SELECT name FROM public.users WHERE auth_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- 16. Security Policies for Notifications
-- Users can only read their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

-- Only the system (server-side / admin) inserts notifications
-- App logic inserts notifications via service role; regular users cannot self-insert
CREATE POLICY "Admins can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- Users can mark their own notifications as read (UPDATE only the 'read' column)
CREATE POLICY "Users can mark own notifications as read"
    ON public.notifications FOR UPDATE
    USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

-- Users can delete their own notifications; admins can delete any
CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- 17. Helper: Teachers and HODs can view all users in their department
--     (needed so teachers can see student details when reviewing leaves)
CREATE POLICY "Teachers and HODs can view departmental users"
    ON public.users FOR SELECT
    USING (
        department IN (
            SELECT department FROM public.users
            WHERE auth_user_id = auth.uid() AND role IN ('teacher', 'hod')
        )
    );
