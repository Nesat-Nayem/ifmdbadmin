'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useState } from 'react'
import {
  Badge,
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Modal,
  Row,
  Toast,
  ToastContainer,
} from 'react-bootstrap'
import {
  IEventParticipationType,
  useCreateParticipationTypeMutation,
  useDeleteParticipationTypeMutation,
  useGetParticipationTypesQuery,
  useUpdateParticipationTypeMutation,
} from '@/store/eventParticipationTypeApi'

const ITEMS_PER_PAGE = 10

const ParticipationTypesList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<IEventParticipationType | null>(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data, isLoading, isError } = useGetParticipationTypesQuery()
  const [createType, { isLoading: isCreating }] = useCreateParticipationTypeMutation()
  const [updateType, { isLoading: isUpdating }] = useUpdateParticipationTypeMutation()
  const [deleteType, { isLoading: isDeleting }] = useDeleteParticipationTypeMutation()

  const showMessage = (msg: string, variant: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(variant)
    setShowToast(true)
  }

  const openCreate = () => {
    setEditingItem(null)
    setFormName('')
    setFormDescription('')
    setFormIsActive(true)
    setShowModal(true)
  }

  const openEdit = (item: IEventParticipationType) => {
    setEditingItem(item)
    setFormName(item.name)
    setFormDescription(item.description || '')
    setFormIsActive(item.isActive)
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      showMessage('Name is required', 'danger')
      return
    }
    try {
      if (editingItem) {
        await updateType({ id: editingItem._id, data: { name: formName.trim(), description: formDescription.trim(), isActive: formIsActive } }).unwrap()
        showMessage('Participation type updated successfully!')
      } else {
        await createType({ name: formName.trim(), description: formDescription.trim() }).unwrap()
        showMessage('Participation type created successfully!')
      }
      setShowModal(false)
    } catch (err: any) {
      showMessage(err?.data?.message || 'Operation failed', 'danger')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this participation type?')) return
    try {
      await deleteType(id).unwrap()
      showMessage('Deleted successfully!')
    } catch (err: any) {
      showMessage(err?.data?.message || 'Failed to delete', 'danger')
    }
  }

  const allItems = data?.data ?? []

  const filtered = allItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const isSaving = isCreating || isUpdating

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <CardTitle as="h4" className="mb-0">
                Event Participation Types
              </CardTitle>
              <div className="d-flex align-items-center gap-2 ms-auto">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                  className="form-control form-control-sm"
                  style={{ maxWidth: 200 }}
                />
              </div>
              <button className="btn btn-sm btn-primary" onClick={openCreate}>
                + Add Type
              </button>
            </CardHeader>

            {isLoading ? (
              <div className="text-center py-5">Loading...</div>
            ) : isError ? (
              <div className="text-center py-5 text-danger">Error loading data</div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                    <thead className="bg-light-subtle">
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th style={{ width: 120 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((item, idx) => (
                        <tr key={item._id}>
                          <td>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                          <td className="fw-medium">{item.name}</td>
                          <td className="text-muted">{item.description || '—'}</td>
                          <td>
                            <Badge bg={item.isActive ? 'success' : 'danger'}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button className="btn btn-soft-info btn-sm" onClick={() => openEdit(item)}>
                                <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                              </button>
                              <button
                                className="btn btn-soft-danger btn-sm"
                                onClick={() => handleDelete(item._id)}
                                disabled={isDeleting}
                              >
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginated.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted">
                            No participation types found. Click <strong>+ Add Type</strong> to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <CardFooter className="border-top">
                  <nav>
                    <ul className="pagination justify-content-end mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage((p) => p - 1)}>Previous</button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage((p) => p + 1)}>Next</button>
                      </li>
                    </ul>
                  </nav>
                </CardFooter>
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* Create / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingItem ? 'Edit Participation Type' : 'Add Participation Type'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label fw-medium">Name <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. VIP Guest, Sponsor, Participant"
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-medium">Description</label>
            <textarea
              className="form-control"
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          {editingItem && (
            <div className="mb-3 form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                id="typeIsActive"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="typeIsActive">Active</label>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={isSaving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
          </button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default ParticipationTypesList
