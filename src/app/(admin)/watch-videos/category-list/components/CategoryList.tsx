'use client'

import React, { useState } from 'react'
import { Card, CardBody, Table, Button, Spinner, Badge, Modal } from 'react-bootstrap'
import Link from 'next/link'
import Image from 'next/image'
import { useGetWatchVideoCategoriesQuery, useDeleteWatchVideoCategoryMutation } from '@/store/watchVideosApi'
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'

const CategoryList = () => {
  const [deleteModal, setDeleteModal] = useState({ show: false, id: '', name: '' })
  const { data: categories = [], isLoading, isError, refetch } = useGetWatchVideoCategoriesQuery()
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteWatchVideoCategoryMutation()

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteModal.id).unwrap()
      setDeleteModal({ show: false, id: '', name: '' })
      refetch()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading categories...</p>
        </CardBody>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="text-center py-5 text-danger">
          Error loading categories. 
          <Button variant="outline-primary" className="ms-2" onClick={() => refetch()}>Retry</Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Video Categories ({categories.length})</h4>
            <Link href="/watch-videos/category-add">
              <Button variant="primary"><FaPlus className="me-2" /> Add Category</Button>
            </Link>
          </div>

          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: '60px' }}>Image</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">No categories found</td>
                  </tr>
                ) : (
                  categories.map((cat: any) => (
                    <tr key={cat._id}>
                      <td>
                        {cat.imageUrl ? (
                          <Image
                            src={cat.imageUrl}
                            alt={cat.name}
                            width={50}
                            height={50}
                            className="rounded object-fit-cover"
                          />
                        ) : (
                          <div className="bg-secondary rounded" style={{ width: 50, height: 50 }} />
                        )}
                      </td>
                      <td className="fw-medium">{cat.name}</td>
                      <td><small className="text-muted">{cat.description || 'N/A'}</small></td>
                      <td>{cat.order}</td>
                      <td>
                        <Badge bg={cat.isActive ? 'success' : 'secondary'}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link href={`/watch-videos/category-edit/${cat._id}`}>
                            <Button size="sm" variant="outline-primary"><FaEdit /></Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline-danger"
                            onClick={() => setDeleteModal({ show: true, id: cat._id, name: cat.name })}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, id: '', name: '' })}>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete <strong>{deleteModal.name}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal({ show: false, id: '', name: '' })}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Spinner size="sm" /> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CategoryList
