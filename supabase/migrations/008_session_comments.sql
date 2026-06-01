-- Session comments: admins can post, everyone can read
CREATE TABLE session_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body       TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX session_comments_session_id_idx ON session_comments(session_id);

-- RLS
ALTER TABLE session_comments ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read comments
CREATE POLICY "Anyone can read session comments"
  ON session_comments FOR SELECT
  USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert session comments"
  ON session_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = author_id
        AND profiles.role = 'ADMIN'
    )
  );

-- Only the comment author (admin) can delete their own comments
CREATE POLICY "Admins can delete own comments"
  ON session_comments FOR DELETE
  USING (author_id = author_id);
