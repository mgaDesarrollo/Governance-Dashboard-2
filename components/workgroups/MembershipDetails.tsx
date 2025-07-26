import React, { useState, useEffect } from "react";

interface UserOption {
  id: string;
  name: string;
  email: string;
}

interface Member {
  id: string;
  user: UserOption;
  role: string;
}

interface Props {
  totalMembers: string;
  roles: string[];
  memberDirectoryLink: string;
  workGroupId?: string;
}

const MembershipDetails: React.FC<Props> = ({ totalMembers, roles, memberDirectoryLink, workGroupId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Fetch miembros actuales
  useEffect(() => {
    if (workGroupId) {
      setMembersLoading(true);
      fetch(`/api/workgroups/${workGroupId}/members`)
        .then(res => res.json())
        .then(data => setMembers(data))
        .finally(() => setMembersLoading(false));
    }
  }, [workGroupId, modalOpen, success]);

  useEffect(() => {
    if (modalOpen) {
      fetch("/api/users")
        .then(res => res.json())
        .then(data => setUsers(data));
    }
  }, [modalOpen]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    if (!selectedUser || !workGroupId) return;
    const res = await fetch(`/api/workgroups/${workGroupId}/add-member`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setSuccess(false);
        setSelectedUser("");
      }, 1200);
    } else {
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = { error: "Unknown error" };
      }
      setError((data as any).error || "Error adding user");
    }
  };

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-purple-700 p-8 mb-6 flex flex-col gap-6">
      <h3 className="text-2xl font-bold flex items-center gap-3 text-purple-300 mb-2 drop-shadow">
        <span className="text-3xl">👥</span>
        Membership & Roles
      </h3>
      <div>
        <span className="font-semibold text-purple-200 text-lg">Current Members:</span>
        {membersLoading ? (
          <span className="ml-2 text-slate-400 text-sm">Loading...</span>
        ) : members.length === 0 ? (
          <span className="ml-2 text-slate-500 text-sm">No members yet.</span>
        ) : (
          <ul className="mt-2 ml-4 list-disc text-slate-100 text-base space-y-1">
            {members.map((m) => (
              <li key={m.id} className="flex gap-2 items-center">
                <span className="font-medium text-purple-100">{m.user?.name || "Unknown user"}</span>
                <span className="text-xs text-slate-400">({m.user?.email || "No email"})</span>
                <span className="text-xs text-purple-700 bg-purple-200 rounded px-2 py-0.5 ml-2">{m.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {workGroupId && (
        <button
          className="mt-4 bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors w-fit"
          onClick={() => setModalOpen(true)}
        >
          Add user
        </button>
      )}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <form
            className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-8 relative border border-purple-700 flex flex-col gap-4"
            onSubmit={handleAdd}
          >
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-purple-400 text-2xl font-bold"
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-purple-300 mb-2">Add user to WorkGroup</h3>
            <label className="text-slate-300 text-sm font-semibold">Select a user
              <select
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                required
              >
                <option value="">Select a user...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </label>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <button
              type="submit"
              className="mt-4 bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
              disabled={loading || !selectedUser}
            >
              {success ? "Added!" : loading ? "Adding..." : "Add"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

export default MembershipDetails; 