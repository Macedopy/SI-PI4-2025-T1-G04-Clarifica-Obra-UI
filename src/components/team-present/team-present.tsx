import React, { useState, useEffect } from 'react';
import { Users, X, Plus, Edit3, Save, Clock, UserCheck, UserX, Coffee } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  cpf: string;
  hoursWorked: number;
  status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE';
  avatar: string;
  notes: string;
}

interface EquipeUtilizadaProps {
  isReadOnly?: boolean;
  faseId: string;
  onEquipeChange?: (equipe: TeamMember[]) => void;
  initialData?: TeamMember[];
}

export const EquipeUtilizada: React.FC<EquipeUtilizadaProps> = ({
  isReadOnly = false,
  faseId,
  onEquipeChange,
  initialData,
}) => {
  const STORAGE_KEY = `equipe-fase-${faseId}`;
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [editTemp, setEditTemp] = useState({
    name: '',
    role: '',
    cpf: '',
    hoursWorked: 0,
    status: 'PRESENT' as 'PRESENT' | 'ABSENT' | 'ON_LEAVE',
    notes: '',
  });

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setMembers(initialData);
      onEquipeChange?.(initialData);
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as TeamMember[];
        setMembers(parsed);
        onEquipeChange?.(parsed);
      }
    }
  }, [faseId, initialData]);

  useEffect(() => {
    if (members.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
      onEquipeChange?.(members);
    }
  }, [members]);

  const addMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: 'New Member',
      role: 'Helper',
      cpf: '',
      hoursWorked: 8,
      status: 'PRESENT',
      avatar: '',
      notes: '',
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setEditingId(null);
  };

  const updateMember = (id: string, updates: Partial<TeamMember>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const openEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setEditTemp({
      name: member.name,
      role: member.role,
      cpf: member.cpf,
      hoursWorked: member.hoursWorked,
      status: member.status,
      notes: member.notes,
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMember(editingId, editTemp);
    setEditingId(null);
  };

  const getStatusIcon = (status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE') => {
    switch (status) {
      case 'PRESENT':
        return <UserCheck className="text-green-600" size={18} />;
      case 'ABSENT':
        return <UserX className="text-red-600" size={18} />;
      case 'ON_LEAVE':
        return <Coffee className="text-orange-600" size={18} />;
    }
  };

  const getStatusColor = (status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE') => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800';
      case 'ABSENT':
        return 'bg-red-100 text-red-800';
      case 'ON_LEAVE':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="text-indigo-600" size={28} />
          <h3 className="text-xl font-bold">Equipe da Fase</h3>
        </div>
        {!isReadOnly && (
          <button
            onClick={addMember}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow"
          >
            <Plus size={18} />
            Adicionar Membro
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users size={48} className="mx-auto mb-3 text-gray-300" />
          <p>Nenhum membro adicionado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className={`border rounded-xl p-5 shadow-sm transition-all relative ${
                editingId === member.id
                  ? 'ring-2 ring-indigo-500 bg-indigo-50'
                  : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow'
              }`}
            >
              {!isReadOnly && (
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  {editingId !== member.id ? (
                    <button
                      onClick={() => openEdit(member)}
                      className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow"
                    >
                      <Edit3 size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={saveEdit}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow"
                    >
                      <Save size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => removeMember(member.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {editingId === member.id ? (
                <div className="space-y-3">
                  <div className="flex justify-center mb-3">
                    <div className="w-20 h-20 bg-gray-200 border-2 border-dashed rounded-full flex items-center justify-center">
                      <Users className="text-gray-400" size={32} />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={editTemp.name}
                    onChange={(e) => setEditTemp({ ...editTemp, name: e.target.value })}
                    className="w-full p-2 border rounded text-center font-bold"
                    placeholder="Nome completo"
                  />
                  <input
                    type="text"
                    value={editTemp.role}
                    onChange={(e) => setEditTemp({ ...editTemp, role: e.target.value })}
                    className="w-full p-2 border rounded text-center text-sm"
                    placeholder="Função"
                  />
                  <input
                    type="text"
                    value={editTemp.cpf}
                    onChange={(e) => setEditTemp({ ...editTemp, cpf: e.target.value })}
                    className="w-full p-2 border rounded text-xs text-center"
                    placeholder="CPF (opcional)"
                  />
                  <div className="flex items-center gap-2">
                    <Clock className="text-blue-600" size={18} />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editTemp.hoursWorked}
                      onChange={(e) => setEditTemp({ ...editTemp, hoursWorked: Number(e.target.value) })}
                      className="flex-1 p-2 border rounded text-center font-bold text-blue-600"
                    />
                    <span className="text-sm">h</span>
                  </div>
                  <select
                    value={editTemp.status}
                    onChange={(e) =>
                      setEditTemp({ ...editTemp, status: e.target.value as 'PRESENT' | 'ABSENT' | 'ON_LEAVE' })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="PRESENT">Presente</option>
                    <option value="ABSENT">Ausente</option>
                    <option value="ON_LEAVE">Folga</option>
                  </select>
                  <textarea
                    value={editTemp.notes}
                    onChange={(e) => setEditTemp({ ...editTemp, notes: e.target.value })}
                    className="w-full p-2 border rounded text-xs"
                    rows={2}
                    placeholder="Observação"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex flex-col items-center mb-3">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
{(member.name || '')
  .split(' ')
  .map((n) => n[0])
  .join('')
  .toUpperCase()
  .slice(0, 2)}
                    </div>
                    <p className="font-bold text-gray-800 mt-2">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.role}</p>
                    {member.cpf && <p className="text-xs text-gray-500">{member.cpf}</p>}
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="text-blue-600" size={16} />
                      <span className="font-bold text-blue-600">{member.hoursWorked}h</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(member.status)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(member.status)}`}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                  {member.notes && (
                    <p className="text-xs text-gray-500 mt-3 italic text-center">"{member.notes}"</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
