-- VibeLab Database Schema
-- This migration creates the necessary tables for VibeLab

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    lyrics TEXT,
    bpm INTEGER DEFAULT 140,
    key TEXT DEFAULT 'C',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracks table
CREATE TABLE IF NOT EXISTS public.tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('beat', 'vocal')),
    file_path TEXT NOT NULL,
    position REAL DEFAULT 0,
    effects JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Projects RLS Policies
-- Allow users to view their own projects
CREATE POLICY "Users can view their own projects"
    ON public.projects
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to create their own projects
CREATE POLICY "Users can create their own projects"
    ON public.projects
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own projects
CREATE POLICY "Users can update their own projects"
    ON public.projects
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to delete their own projects
CREATE POLICY "Users can delete their own projects"
    ON public.projects
    FOR DELETE
    USING (auth.uid() = user_id);

-- Tracks RLS Policies
-- Allow users to view tracks from their own projects
CREATE POLICY "Users can view tracks from their own projects"
    ON public.tracks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = tracks.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Allow users to create tracks in their own projects
CREATE POLICY "Users can create tracks in their own projects"
    ON public.tracks
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = tracks.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Allow users to update tracks in their own projects
CREATE POLICY "Users can update tracks in their own projects"
    ON public.tracks
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = tracks.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Allow users to delete tracks from their own projects
CREATE POLICY "Users can delete tracks from their own projects"
    ON public.tracks
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = tracks.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracks_project_id ON public.tracks(project_id);
