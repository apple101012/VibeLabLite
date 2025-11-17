export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          lyrics: string | null
          bpm: number | null
          key: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          lyrics?: string | null
          bpm?: number | null
          key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          lyrics?: string | null
          bpm?: number | null
          key?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          project_id: string
          type: 'beat' | 'vocal'
          file_path: string
          position: number
          effects: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          type: 'beat' | 'vocal'
          file_path: string
          position: number
          effects?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: 'beat' | 'vocal'
          file_path?: string
          position?: number
          effects?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface VocalEffects {
  autotune?: {
    strength: number
  }
  reverb?: number
  compression?: 'light' | 'medium' | 'heavy'
  eq?: {
    low: number
    mid: number
    high: number
  }
  noiseReduction?: boolean
}

export interface ProjectData {
  version: string
  tracks: TrackData[]
  lyrics: string
  settings: {
    bpm: number
    key: string
  }
}

export interface TrackData {
  id: string
  type: 'beat' | 'vocal'
  file: string
  start: number
  effects?: VocalEffects
}
