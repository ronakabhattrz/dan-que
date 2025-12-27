-- Fix infinite recursion in user_roles policies
-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

-- Create separate policies for different operations to avoid recursion

-- Admins can insert roles (but we need to avoid the recursion)
-- Solution: Use a more permissive policy for INSERT that allows users to create their own initial role
CREATE POLICY "Users can insert own role"
  ON user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can update roles
CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete roles
CREATE POLICY "Admins can delete roles"
  ON user_roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
