import { useEffect, useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Tenants() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [units, setUnits] = useState([])
  const [assignModal, setAssignModal] = useState(null)
  const [addModal, setAddModal] = useState(false)
  const [detailModal, setDetailModal] = useState(null)
  const [editModal, setEditModal] = useState(null)
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', address: '' })

  useEffect(() => {
    fetchTenants()
    fetchUnits()
  }, [])

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants')
      setTenants(response.data.tenants)
    } catch (error) {
      toast.error('Failed to load tenants')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnits = async () => {
    try {
      const response = await api.get('/units')
      const all = response.data.units || []
      setUnits(all.filter((u) => u.status === 'available'))
    } catch (error) {
      console.error('Failed to load units')
    }
  }

  const handleAssignUnit = async (tenantId, unitId) => {
    try {
      await api.post(`/tenants/${tenantId}/assign-unit`, { unit_id: Number(unitId) })
      toast.success('Tenant assigned to unit successfully')
      setAssignModal(null)
      fetchTenants()
      fetchUnits()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign unit')
    }
  }

  const handleRemoveUnit = async (tenantId) => {
    if (!window.confirm('Remove this tenant from their unit?')) return
    try {
      await api.post(`/tenants/${tenantId}/remove-unit`)
      toast.success('Tenant removed from unit')
      fetchTenants()
      fetchUnits()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove unit')
    }
  }

  const handleAddTenant = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/tenants', { 
        name: addForm.name, 
        email: addForm.email || null,
        phone: addForm.phone || null,
        address: addForm.address || null
      })
      toast.success(`Tenant created. Login: ${res.data.login_email} / ${res.data.login_password}`)
      setAddModal(false)
      setAddForm({ name: '', email: '', phone: '', address: '' })
      fetchTenants()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add tenant')
    }
  }

  const handleEditTenant = async (e) => {
    e.preventDefault()
    if (!editModal) return
    try {
      await api.put(`/tenants/${editModal.id}`, { 
        name: editForm.name, 
        email: editForm.email || null,
        phone: editForm.phone || null,
        address: editForm.address || null
      })
      toast.success('Tenant updated successfully')
      setEditModal(null)
      fetchTenants()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update tenant')
    }
  }

  if (loading) return <div className="flex items-center justify-center py-24 text-slate-500">Loading tenants...</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Tenants</h1>
        <button onClick={() => setAddModal(true)} className="btn-primary">Add Tenant</button>
      </div>

      <div className="table-wrap">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr>
              <th className="table-th">Name</th>
              <th className="table-th">Email</th>
              <th className="table-th">Phone</th>
              <th className="table-th">Address</th>
              <th className="table-th">Unit</th>
              <th className="table-th">Unpaid Bills</th>
              <th className="table-th">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-slate-50/50">
                <td className="table-td font-medium text-slate-900">{tenant.name}</td>
                <td className="table-td text-slate-600">{tenant.email}</td>
                <td className="table-td text-slate-600">{tenant.phone || '–'}</td>
                <td className="table-td text-slate-600">{tenant.address || '–'}</td>
                <td className="table-td text-slate-600">{tenant.unit_number ? `${tenant.building} – ${tenant.unit_number}` : '–'}</td>
                <td className="table-td">
                  {tenant.unpaid_amount > 0 ? <span className="text-rose-600 font-semibold">₱{parseFloat(tenant.unpaid_amount).toLocaleString()}</span> : <span className="text-emerald-600">₱0</span>}
                </td>
                <td className="table-td">
                  <div className="flex gap-2">
                    <button onClick={() => setDetailModal(tenant)} className="text-slate-600 hover:text-slate-900 font-medium text-sm">View</button>
                    {tenant.unit_id ? <button onClick={() => handleRemoveUnit(tenant.id)} className="text-rose-600 hover:text-rose-800 font-medium text-sm">Remove Unit</button> : <button onClick={() => setAssignModal(tenant)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">Assign Unit</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {addModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Add Tenant</h3>
            <form onSubmit={handleAddTenant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" required className="w-full rounded-lg border border-gray-300 px-3 py-2" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full rounded-lg border border-gray-300 px-3 py-2" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2" value={addForm.address} onChange={(e) => setAddForm({ ...addForm, address: e.target.value })} placeholder="Optional" rows="3" />
              </div>
              <p className="text-xs text-gray-500">A login email (e.g. tenant2@ancheta.com) and default password will be generated.</p>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setAddModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Create Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Assign Unit to {assignModal.name}</h3>
            {units.length === 0 ? (
              <p className="text-gray-500">No available units.</p>
            ) : (
              <div className="space-y-2">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="border rounded-lg p-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center"
                    onClick={() => handleAssignUnit(assignModal.id, unit.id)}
                  >
                    <div>
                      <span className="font-semibold">{unit.building} - {unit.unit_number}</span>
                      <span className="text-sm text-gray-500 ml-2">Floor {unit.floor} · ₱{unit.rent_amount?.toLocaleString()}/mo</span>
                    </div>
                    <span className="text-indigo-600 text-sm font-medium">Select</span>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => setAssignModal(null)} className="mt-4 w-full py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {detailModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{detailModal.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-slate-900">{detailModal.email || '–'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-slate-900">{detailModal.phone || '–'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Address</label>
                <p className="text-slate-900">{detailModal.address || '–'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Unit</label>
                <p className="text-slate-900">{detailModal.unit_number ? `${detailModal.building} – ${detailModal.unit_number}` : '–'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Unpaid Bills</label>
                <p className={`${parseFloat(detailModal.unpaid_amount) > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600'}`}>₱{parseFloat(detailModal.unpaid_amount).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => { setDetailModal(null); setEditModal(detailModal); setEditForm({ name: detailModal.name, email: detailModal.email, phone: detailModal.phone, address: detailModal.address }); }} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Edit</button>
              <button type="button" onClick={() => setDetailModal(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Edit Tenant</h3>
            <form onSubmit={handleEditTenant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" required className="w-full rounded-lg border border-gray-300 px-3 py-2" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full rounded-lg border border-gray-300 px-3 py-2" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} rows="3" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditModal(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
