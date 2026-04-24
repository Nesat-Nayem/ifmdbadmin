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
  IEventType,
  useCreateEventTypeMutation,
  useDeleteEventTypeMutation,
  useGetEventTypesQuery,
  useUpdateEventTypeMutation,
} from '@/store/eventTypeApi'

const ITEMS_PER_PAGE = 10

const EventTypesList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<IEventType | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data, isLoading } = useGetEventTypesQuery()
  const [createType, { isLoading: isCreating }] = useCreateEventTypeMutation()
  const [updateType, { isLoading: isUpdating }] = useUpdateEventTypeMutation()
  const [deleteType, { isLoading: isDeleting }] = useDeleteEventTypeMutation()

  const showMessage = (msg: string, variant: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(variant)
    setShowToast(true)
  }

  const openCreate = () => {
    setEditingItem(null)
    setFormTitle('')
    setFormIsActive(true)
    setShowModal(true)
  }

  const openEdit = (item: IEventType) => {
    setEditingItem(item)
    setFormTitle(item.title)
    setFormIsActive(item.isActive)
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formTitle.trim()) {
      showMessage('Title is required', 'danger')
      return
    }
    try {
      if (editingItem) {
        await updateType({
          id: editingItem._id,
          data: { title: formTitle.trim(), isActive: formIsActive },
        }).unwrap()
        showMessage('Event type updated successfully!')
      } else {
        await createType({ title: formTitle.trim() }).unwrap()
        showMessage('Event type created successfully!')
      }
      setShowModal(false)
    } catch (err: any) {
      showMessage(err?.data?.message || 'Operation failed', 'danger')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event type?')) return
    try {
      await deleteType(id).unwrap()
      showMessage('Deleted successfully!')
    } catch (err: any) {
      showMessage(err?.data?.message || 'Failed to delete', 'danger')
    }
  }

  const allItems = data?.data ?? []

  const filtered = allItems.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
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
                Event Types
              </CardTitle>
              <div className="d-flex align-items-center gap-2 ms-auto">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
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
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                    <thead className="bg-light-subtle">
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th style={{ width: 120 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((item, idx) => (
                        <tr key={item._id}>
                          <td>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                          <td className="fw-medium">{item.title}</td>
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
                          <td colSpan={4} className="text-center py-4 text-muted">
                            No data found. Click <strong>+ Add Type</strong> to create one.
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
                        <button className="page-link" onClick={() => setCurrentPage((p) => p - 1)}>
                          Previous
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage((p) => p + 1)}>
                          Next
                        </button>
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
          <Modal.Title>{editingItem ? 'Edit Event Type' : 'Add Event Type'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label fw-medium">
              Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Comedy, Music, Concert, Workshop"
            />
          </div>
          {editingItem && (
            <div className="mb-3 form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                id="eventTypeIsActive"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="eventTypeIsActive">
                Active
              </label>
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

export default EventTypesList
