import { getCustomerTeamDashboard } from "@/lib/sugent/customer-team/customerTeamEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function CustomerTeamPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const data = await getCustomerTeamDashboard(organizationId);

  if (!data.ok) {
    return (
      <main className="p-6">
        <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-100">
          Team organization not found.
        </div>
      </main>
    );
  }

  const safeData = data as any;

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          v4.3 Team Members + Customer Permissions
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">
          {safeData.organization.name} Team
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Invite members, assign roles, manage permission overrides, and review customer access controls.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <Metric label="Members" value={String(safeData.summary.members)} />
        <Metric label="Active" value={String(safeData.summary.activeMembers)} />
        <Metric label="Pending Invites" value={String(safeData.summary.pendingInvitations)} />
        <Metric label="Owners" value={String(safeData.summary.owners)} />
        <Metric label="Admins" value={String(safeData.summary.admins)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Invite Team Member</h2>

          <form action={`/api/customer-org/${organizationId}/team/invitations`} method="POST" className="mt-4 grid gap-3">
            <input name="email" type="email" placeholder="teammate@example.com" required className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <select name="role" defaultValue="viewer" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
              <option value="billing">Billing</option>
            </select>

            <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
              Create Invitation
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Create Permission Override</h2>

          <form action={`/api/customer-org/${organizationId}/permissions/override`} method="POST" className="mt-4 grid gap-3">
            <input name="resourceType" defaultValue="organization" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="action" defaultValue="project:view" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <select name="effect" defaultValue="allow" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="allow">Allow</option>
              <option value="deny">Deny</option>
            </select>

            <input name="reason" placeholder="Reason" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <button className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-black text-black hover:bg-yellow-400">
              Add Override
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Members</h2>

        <div className="mt-4 space-y-3">
          {safeData.memberships.map((membership: any) => (
            <div key={membership.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-black text-white">{membership.user?.name || membership.user?.email || membership.userId}</div>
                  <div className="mt-1 text-xs text-cyan-300">{membership.role} · {membership.status}</div>
                  <div className="mt-1 font-mono text-[11px] text-muted">{membership.id}</div>
                </div>

                <form action={`/api/customer-org/${organizationId}/team/members/${membership.id}`} method="POST" className="flex flex-wrap gap-2">
                  <select name="role" defaultValue={membership.role} className="rounded-xl border border-border bg-slate-950 px-3 py-2 text-xs text-white outline-none">
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                    <option value="billing">Billing</option>
                  </select>

                  <select name="status" defaultValue={membership.status} className="rounded-xl border border-border bg-slate-950 px-3 py-2 text-xs text-white outline-none">
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="removed">Removed</option>
                  </select>

                  <button className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-black text-white hover:bg-cyan-500">
                    Update
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Invitations</h2>

        <div className="mt-4 space-y-3">
          {safeData.invitations.length ? safeData.invitations.map((invitation: any) => (
            <div key={invitation.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-black text-white">{invitation.email}</div>
                  <div className="mt-1 text-xs text-cyan-300">{invitation.role} · {invitation.status}</div>
                  <div className="mt-1 font-mono text-[11px] text-muted">{invitation.id}</div>
                </div>

                {invitation.status === "pending" && (
                  <form action={`/api/customer-org/${organizationId}/team/invitations/${invitation.id}/revoke`} method="POST">
                    <button className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100 hover:bg-red-500/20">
                      Revoke
                    </button>
                  </form>
                )}
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-border bg-slate-950 p-3 text-sm text-muted">
              No invitations yet.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Permission Overrides</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(safeData.overrides, null, 2)}
        </pre>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-panel/70 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-2 truncate text-2xl font-black text-white">{value}</div>
    </div>
  );
}
