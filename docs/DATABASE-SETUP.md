# VietMoney Database Setup Guide

## Overview

This guide will walk you through setting up a complete database solution for the VietMoney app using Supabase. The database will support all features including transactions, savings goals, projects, and user profiles.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Database Schema](#database-schema)
4. [Security & RLS](#security--rls)
5. [Environment Configuration](#environment-configuration)
6. [Frontend Integration](#frontend-integration)
7. [Data Migration](#data-migration)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- A Supabase account (free tier available)
- Basic understanding of SQL
- Node.js and npm installed
- The VietMoney app codebase

## Supabase Setup

### Step 1: Create a New Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
    - **Name**: `vietmoney-app`
    - **Database Password**: Generate a strong password (save this!)
    - **Region**: Choose closest to your users (Singapore for Vietnam)
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

### Step 2: Get Project Credentials

1. Go to Project Settings → API
2. Copy the following values:
    - **Project URL**: `https://your-project-id.supabase.co`
    - **Anon Public Key**: `eyJ...` (starts with eyJ)
    - **Service Role Key**: `eyJ...` (keep this secret!)

## Database Schema

### Core Tables

#### 1. Users Profile Table
```sql
-- Extends Supabase auth.users with additional profile information
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  occupation TEXT,
  birth_date DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount BIGINT NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  location TEXT,
  tags TEXT[],
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. Savings Goals Table
```sql
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  target_amount BIGINT NOT NULL CHECK (target_amount > 0),
  current_amount BIGINT DEFAULT 0 CHECK (current_amount >= 0),
  deadline DATE NOT NULL,
  category TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  budget BIGINT NOT NULL CHECK (budget > 0),
  total_expenses BIGINT DEFAULT 0 CHECK (total_expenses >= 0),
  total_revenue BIGINT DEFAULT 0 CHECK (total_revenue >= 0),
  status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'completed', 'on-hold')),
  start_date DATE NOT NULL,
  end_date DATE,
  category TEXT NOT NULL,
  currency TEXT DEFAULT 'VND' CHECK (currency IN ('VND', 'USD')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. Project Expenses Table
```sql
CREATE TABLE project_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. Project Revenues Table
```sql
CREATE TABLE project_revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'received', 'overdue')),
  paid_amount BIGINT DEFAULT 0 CHECK (paid_amount >= 0),
  invoice_number TEXT,
  due_date DATE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 7. Savings Contributions Table
```sql
CREATE TABLE savings_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES savings_goals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes for Performance

```sql
-- Transaction indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);

-- Project indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_expenses_project_id ON project_expenses(project_id);
CREATE INDEX idx_project_revenues_project_id ON project_revenues(project_id);

-- Savings goals indexes
CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX idx_savings_goals_deadline ON savings_goals(deadline);
CREATE INDEX idx_savings_contributions_goal_id ON savings_contributions(goal_id);
```

## Security & RLS

### Enable Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_contributions ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

#### Profiles Policies
```sql
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### Transactions Policies
```sql
-- Users can manage their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
```

#### Savings Goals Policies
```sql
-- Users can manage their own savings goals
CREATE POLICY "Users can view own savings goals" ON savings_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings goals" ON savings_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals" ON savings_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings goals" ON savings_goals
  FOR DELETE USING (auth.uid() = user_id);
```

#### Projects Policies
```sql
-- Users can manage their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);
```

#### Project Expenses Policies
```sql
CREATE POLICY "Users can view own project expenses" ON project_expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project expenses" ON project_expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project expenses" ON project_expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own project expenses" ON project_expenses
  FOR DELETE USING (auth.uid() = user_id);
```

#### Project Revenues Policies
```sql
CREATE POLICY "Users can view own project revenues" ON project_revenues
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project revenues" ON project_revenues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project revenues" ON project_revenues
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own project revenues" ON project_revenues
  FOR DELETE USING (auth.uid() = user_id);
```

#### Savings Contributions Policies
```sql
CREATE POLICY "Users can view own savings contributions" ON savings_contributions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings contributions" ON savings_contributions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Database Functions

#### Update Timestamps Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

#### Apply Timestamp Triggers
```sql
-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON savings_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Project Totals Update Function
```sql
CREATE OR REPLACE FUNCTION update_project_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update project expenses total
  IF TG_TABLE_NAME = 'project_expenses' THEN
    UPDATE projects 
    SET total_expenses = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM project_expenses 
      WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    )
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  END IF;

  -- Update project revenue total
  IF TG_TABLE_NAME = 'project_revenues' THEN
    UPDATE projects 
    SET total_revenue = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM project_revenues 
      WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    )
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';
```

#### Apply Project Totals Triggers
```sql
CREATE TRIGGER update_project_expenses_total 
  AFTER INSERT OR UPDATE OR DELETE ON project_expenses
  FOR EACH ROW EXECUTE FUNCTION update_project_totals();

CREATE TRIGGER update_project_revenues_total 
  AFTER INSERT OR UPDATE OR DELETE ON project_revenues
  FOR EACH ROW EXECUTE FUNCTION update_project_totals();
```

#### Savings Goal Update Function
```sql
CREATE OR REPLACE FUNCTION update_savings_goal_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current amount and completion status
  UPDATE savings_goals 
  SET 
    current_amount = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM savings_contributions 
      WHERE goal_id = COALESCE(NEW.goal_id, OLD.goal_id)
    ),
    is_completed = (
      SELECT COALESCE(SUM(amount), 0) >= target_amount
      FROM savings_contributions 
      WHERE goal_id = COALESCE(NEW.goal_id, OLD.goal_id)
    )
  WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';
```

#### Apply Savings Goal Trigger
```sql
CREATE TRIGGER update_savings_goal_amount_trigger 
  AFTER INSERT OR UPDATE OR DELETE ON savings_contributions
  FOR EACH ROW EXECUTE FUNCTION update_savings_goal_amount();
```

## Environment Configuration

### Create .env File

Create a `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Update .env.example

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Frontend Integration

### Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

### Generate TypeScript Types

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Generate types:
```bash
supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts
```

### Authentication Setup

Create `src/lib/auth.ts`:

```typescript
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  profile?: {
    full_name: string
    email: string
    phone?: string
    location?: string
    occupation?: string
  }
}

export const auth = {
  // Sign up with email and password
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (error) throw error

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          email: email,
        })

      if (profileError) throw profileError
    }

    return data
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    // Get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      ...user,
      profile: profile || undefined
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}
```

### Database Service Layer

Create `src/lib/database.ts`:

```typescript
import { supabase } from './supabase'
import type { Database } from './database.types'

type Tables = Database['public']['Tables']
type Transaction = Tables['transactions']['Row']
type SavingsGoal = Tables['savings_goals']['Row']
type Project = Tables['projects']['Row']

export const db = {
  // Transactions
  transactions: {
    async getAll() {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    async create(transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },

    async update(id: string, updates: Partial<Transaction>) {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
    }
  },

  // Savings Goals
  savingsGoals: {
    async getAll() {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    async create(goal: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('savings_goals')
        .insert({
          ...goal,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },

    async addContribution(goalId: string, amount: number, description?: string) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('savings_contributions')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          amount,
          description,
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  // Projects
  projects: {
    async getAll() {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_expenses(*),
          project_revenues(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    async create(project: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...project,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  }
}
```

## Data Migration

### Migration from LocalStorage

Create `src/lib/migration.ts`:

```typescript
import { db } from './database'
import { auth } from './auth'

export async function migrateFromLocalStorage() {
  const user = await auth.getCurrentUser()
  if (!user) throw new Error('User must be authenticated to migrate data')

  try {
    // Migrate transactions
    const transactions = JSON.parse(localStorage.getItem('vietnamese-money-tracker-transactions') || '[]')
    for (const transaction of transactions) {
      await db.transactions.create({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        payment_method: transaction.paymentMethod,
        location: transaction.location,
        tags: transaction.tags,
      })
    }

    // Migrate savings goals
    const goals = JSON.parse(localStorage.getItem('vietnamese-money-tracker-goals') || '[]')
    for (const goal of goals) {
      await db.savingsGoals.create({
        title: goal.title,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        deadline: goal.deadline,
        category: goal.category,
        is_completed: goal.isCompleted,
      })
    }

    // Clear localStorage after successful migration
    localStorage.removeItem('vietnamese-money-tracker-transactions')
    localStorage.removeItem('vietnamese-money-tracker-goals')
    localStorage.removeItem('vietnamese-money-tracker-projects')
    
    console.log('Data migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}
```

## Testing

### Test Database Connection

Create `src/lib/__tests__/database.test.ts`:

```typescript
import { supabase } from '../supabase'

describe('Database Connection', () => {
  test('should connect to Supabase', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    expect(error).toBeNull()
    expect(data).toBeDefined()
  })
})
```

### Test Authentication

```typescript
import { auth } from '../auth'

describe('Authentication', () => {
  test('should handle sign up', async () => {
    const email = 'test@example.com'
    const password = 'testpassword123'
    const fullName = 'Test User'

    // Note: Use test environment for this
    const result = await auth.signUp(email, password, fullName)
    expect(result.user).toBeDefined()
  })
})
```

## Troubleshooting

### Common Issues

#### 1. RLS Policy Errors
**Error**: `new row violates row-level security policy`

**Solution**: Check that your RLS policies allow the operation and that the user is authenticated.

```sql
-- Debug RLS policies
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';
```

#### 2. Foreign Key Violations
**Error**: `violates foreign key constraint`

**Solution**: Ensure referenced records exist before creating dependent records.

#### 3. Environment Variables Not Loading
**Error**: `Missing Supabase environment variables`

**Solution**:
- Check `.env` file exists and has correct values
- Restart development server after adding environment variables
- Ensure variables start with `VITE_` for client-side access

#### 4. Type Generation Issues
**Error**: Types not matching database schema

**Solution**:
```bash
# Regenerate types
supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts
```

### Performance Optimization

#### 1. Add Indexes for Common Queries
```sql
-- Add indexes based on your query patterns
CREATE INDEX CONCURRENTLY idx_transactions_user_date 
ON transactions(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_projects_user_status 
ON projects(user_id, status);
```

#### 2. Use Pagination for Large Datasets
```typescript
// Example pagination
const { data, error } = await supabase
  .from('transactions')
  .select('*')
  .range(0, 49) // First 50 records
  .order('created_at', { ascending: false })
```

#### 3. Optimize Queries with Select
```typescript
// Only select needed columns
const { data, error } = await supabase
  .from('projects')
  .select('id, name, status, total_expenses, total_revenue')
  .eq('user_id', userId)
```

### Backup and Recovery

#### 1. Regular Backups
Supabase automatically backs up your database, but you can also:

```bash
# Export data
supabase db dump --project-id your-project-id > backup.sql
```

#### 2. Point-in-Time Recovery
Available in Supabase Pro plan for up to 7 days.

### Monitoring

#### 1. Enable Logging
In Supabase Dashboard → Settings → API → Enable "Log all queries"

#### 2. Monitor Performance
Use Supabase Dashboard → Reports to monitor:
- Query performance
- Database size
- Active connections

## Next Steps

1. **Set up the database** following this guide
2. **Test the connection** with a simple query
3. **Migrate existing data** from localStorage
4. **Implement real-time features** using Supabase subscriptions
5. **Add data validation** on both client and server side
6. **Set up monitoring** and alerts
7. **Plan for scaling** as your user base grows

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase TypeScript Support](https://supabase.com/docs/reference/javascript/typescript-support)

---

**Note**: This guide assumes you're using the free tier of Supabase. For production applications, consider upgrading to a paid plan for better performance, more storage, and additional features.
