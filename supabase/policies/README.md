# Supabase Row Level Security Policies

This folder contains Row Level Security policy documentation and SQL for AIM.

Future policy groups:

```txt
student_policies.sql
parent_policies.sql
admin_policies.sql
audit_policies.sql
```

RLS principles:

* Students can only access their own learning records.
* Parents can only access linked child progress records.
* Admins can manage academic content and reports.
* Sensitive AIM analysis records should be protected by strict access rules.
* Service-role access must never be exposed to frontend clients.
