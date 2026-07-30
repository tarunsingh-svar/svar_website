/**
 * Rewrite catalogue. Ids match svar_ai_flask/services/rewrite_registry.py and
 * svar_ai/lib/core/constants/plan_limits.dart; titles and descriptions match
 * the mobile rewrite sheet so both platforms describe the same thing.
 */

export interface RewriteOption {
  id: string;
  title: string;
  description: string;
  /** Flask route that generates this rewrite. */
  endpoint: string;
}

export interface RewriteGroup {
  label: string;
  options: RewriteOption[];
}

export const REWRITE_GROUPS: RewriteGroup[] = [
  {
    label: "Core Productivity",
    options: [
      {
        id: "quick_list",
        title: "Quick List",
        description: "Converts thoughts into clean bullet points",
        endpoint: "/generate_quick_list",
      },
      {
        id: "meeting_notes",
        title: "Meeting Notes",
        description: "Turns discussions into clean summaries",
        endpoint: "/generate_meeting_notes",
      },
      {
        id: "todo_list",
        title: "To-do List",
        description: "Checklist-ready action items",
        endpoint: "/generate_todo_list",
      },
    ],
  },
  {
    label: "Work Meetings & Collaboration",
    options: [
      {
        id: "daily_standup",
        title: "Daily Standup",
        description: "Classic stand-up style update",
        endpoint: "/generate_daily_standup",
      },
      {
        id: "feature_discussion",
        title: "Feature Discussion",
        description: "Structured product talk format",
        endpoint: "/generate_feature_discussion",
      },
      {
        id: "interview_summary",
        title: "User Interview Summary",
        description: "Extract insights from interviews",
        endpoint: "/generate_interview_summary",
      },
      {
        id: "delegation_note",
        title: "Delegation Note",
        description: "Assigns tasks clearly using Who / What / When",
        endpoint: "/generate_delegation_note",
      },
    ],
  },
  {
    label: "Professional Writing",
    options: [
      {
        id: "email_casual",
        title: "Email — Casual",
        description: "Friendly, short emails for informal updates",
        endpoint: "/generate_email_casual",
      },
      {
        id: "email_formal",
        title: "Email — Formal",
        description: "Structured, professional emails",
        endpoint: "/generate_email_formal",
      },
    ],
  },
  {
    label: "Creator",
    options: [
      {
        id: "x_post",
        title: "X Post",
        description: "Make an engaging tweet",
        endpoint: "/generate_x_post",
      },
      {
        id: "x_thread",
        title: "X Thread",
        description: "Transform into a series of tweets",
        endpoint: "/generate_x_thread",
      },
      {
        id: "short_video_script",
        title: "Short Video Script",
        description: "An attention-catching Reel or Short script",
        endpoint: "/generate_video_script",
      },
      {
        id: "linkedin_post",
        title: "LinkedIn Post",
        description: "Make a professional post",
        endpoint: "/generate_linkedin_post",
      },
      {
        id: "content_outline",
        title: "Content Outline",
        description: "Structured outline for posts, videos or newsletters",
        endpoint: "/generate_content_outline",
      },
    ],
  },
  {
    label: "Learning & Research",
    options: [
      {
        id: "lecture_summary",
        title: "Lecture / Class Summary",
        description: "Turns a lecture into clean class notes",
        endpoint: "/generate_lecture_summary",
      },
    ],
  },
  {
    label: "Journaling & Personal",
    options: [
      {
        id: "journal",
        title: "Daily Journal Entry",
        description: "Summarises personal reflections or thoughts",
        endpoint: "/generate_journal",
      },
    ],
  },
];

export const REWRITE_OPTIONS: RewriteOption[] = REWRITE_GROUPS.flatMap(
  (group) => group.options
);

const BY_ID = new Map(REWRITE_OPTIONS.map((option) => [option.id, option]));

export function getRewriteOption(id: string): RewriteOption | undefined {
  return BY_ID.get(id);
}
