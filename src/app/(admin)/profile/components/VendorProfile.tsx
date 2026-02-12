'use client'

import React, { useState, useEffect } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Form,
  Button,
  Spinner,
  Alert,
  Badge,
  Nav,
  Tab,
  InputGroup,
} from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } from '@/store/profileApi'
import {
  useGetWalletStatsQuery,
  useUpdateBankDetailsMutation,
  useDeleteBankDetailsMutation,
  useRequestWithdrawalMutation,
  useGetMyWithdrawalsQuery,
  IBankDetails,
} from '@/store/walletApi'
import { FaUser, FaLock, FaUniversity, FaWallet, FaHistory, FaEye, FaEyeSlash } from 'react-icons/fa'

const VendorProfile = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const userId = user?._id || ''

  const [activeTab, setActiveTab] = useState('profile')
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  // Profile state
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Bank details state
  const [bankForm, setBankForm] = useState<IBankDetails>({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    upiId: '',
  })

  // Withdrawal state
  const [withdrawAmount, setWithdrawAmount] = useState('')

  // Queries
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useGetProfileQuery(userId, { skip: !userId })
  const { data: walletStats, isLoading: walletLoading, refetch: refetchWallet } = useGetWalletStatsQuery(undefined, { skip: user?.role !== 'vendor' })
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useGetMyWithdrawalsQuery({ page: 1, limit: 5 }, { skip: user?.role !== 'vendor' })

  // Mutations
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation()
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation()
  const [updateBankDetails, { isLoading: isUpdatingBank }] = useUpdateBankDetailsMutation()
  const [deleteBankDetails, { isLoading: isDeletingBank }] = useDeleteBankDetailsMutation()
  const [requestWithdrawal, { isLoading: isRequestingWithdrawal }] = useRequestWithdrawalMutation()

  // Populate forms with existing data
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        phone: profile.phone || '',
      })
    }
  }, [profile])

  useEffect(() => {
    if (walletStats?.wallet?.bankDetails) {
      setBankForm({
        accountHolderName: walletStats.wallet.bankDetails.accountHolderName || '',
        accountNumber: walletStats.wallet.bankDetails.accountNumber || '',
        ifscCode: walletStats.wallet.bankDetails.ifscCode || '',
        bankName: walletStats.wallet.bankDetails.bankName || '',
        branchName: walletStats.wallet.bankDetails.branchName || '',
        upiId: walletStats.wallet.bankDetails.upiId || '',
      })
    }
  }, [walletStats])

  const showMessage = (type: 'success' | 'danger', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile({ userId, data: profileForm }).unwrap()
      showMessage('success', 'Profile updated successfully!')
      refetchProfile()
    } catch (err: any) {
      showMessage('danger', err?.data?.message || 'Failed to update profile')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('danger', 'New passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      showMessage('danger', 'Password must be at least 6 characters')
      return
    }
    try {
      await changePassword({
        userId,
        data: {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      }).unwrap()
      showMessage('success', 'Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      showMessage('danger', err?.data?.message || 'Failed to change password')
    }
  }

  const handleUpdateBankDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bankForm.accountHolderName || !bankForm.accountNumber || !bankForm.ifscCode || !bankForm.bankName) {
      showMessage('danger', 'Please fill all required bank details')
      return
    }
    try {
      await updateBankDetails(bankForm).unwrap()
      showMessage('success', 'Bank details updated successfully!')
      refetchWallet()
    } catch (err: any) {
      showMessage('danger', err?.data?.message || 'Failed to update bank details')
    }
  }

  const handleDeleteBankDetails = async () => {
    if (!window.confirm('Are you sure you want to delete your bank details? This will also remove your Razorpay Route account.')) {
      return
    }
    try {
      await deleteBankDetails().unwrap()
      setBankForm({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        upiId: '',
      })
      showMessage('success', 'Bank details deleted successfully!')
      refetchWallet()
    } catch (err: any) {
      showMessage('danger', err?.data?.message || 'Failed to delete bank details')
    }
  }

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount < 100) {
      showMessage('danger', 'Minimum withdrawal amount is ₹100')
      return
    }
    if (walletStats && amount > walletStats.wallet.balance) {
      showMessage('danger', 'Insufficient balance')
      return
    }
    try {
      await requestWithdrawal({ amount }).unwrap()
      showMessage('success', 'Withdrawal request submitted successfully!')
      setWithdrawAmount('')
      refetchWallet()
    } catch (err: any) {
      showMessage('danger', err?.data?.message || 'Failed to request withdrawal')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (profileLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading profile...</p>
      </Container>
    )
  }

  const isVendor = user?.role === 'vendor'
  const hasBankDetails = walletStats?.wallet?.bankDetails?.accountNumber && walletStats?.wallet?.bankDetails?.ifscCode

  return (
    <Container fluid>
      {message && (
        <Alert variant={message.type} dismissible onClose={() => setMessage(null)} className="mb-4">
          {message.text}
        </Alert>
      )}

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'profile')}>
        <Row>
          {/* Sidebar Navigation */}
          <Col lg={3} className="mb-4">
            <Card>
              <CardBody className="text-center py-4">
                <div
                  className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 80, height: 80 }}
                >
                  {profile?.img ? (
                    <img src={profile.img} alt="Profile" className="rounded-circle" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                  ) : (
                    <FaUser size={32} className="text-primary" />
                  )}
                </div>
                <h5 className="mb-1">{profile?.name || 'User'}</h5>
                <p className="text-muted mb-2">{profile?.email}</p>
                <Badge bg={user?.role === 'admin' ? 'danger' : user?.role === 'vendor' ? 'success' : 'info'}>
                  {user?.role?.toUpperCase()}
                </Badge>
                {isVendor && user?.vendorServices && (
                  <div className="mt-2">
                    {user.vendorServices.map((service: string) => (
                      <Badge key={service} bg="secondary" className="me-1 mb-1">
                        {service.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardBody>
              <Nav variant="pills" className="flex-column p-3 pt-0">
                <Nav.Item>
                  <Nav.Link eventKey="profile" className="d-flex align-items-center gap-2">
                    <FaUser /> Profile Information
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="password" className="d-flex align-items-center gap-2">
                    <FaLock /> Change Password
                  </Nav.Link>
                </Nav.Item>
                {isVendor && (
                  <>
                    <Nav.Item>
                      <Nav.Link eventKey="bank" className="d-flex align-items-center gap-2">
                        <FaUniversity /> Bank Details
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="withdrawal" className="d-flex align-items-center gap-2">
                        <FaWallet /> Request Withdrawal
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="history" className="d-flex align-items-center gap-2">
                        <FaHistory /> Withdrawal History
                      </Nav.Link>
                    </Nav.Item>
                  </>
                )}
              </Nav>
            </Card>
          </Col>

          {/* Main Content */}
          <Col lg={9}>
            <Tab.Content>
              {/* Profile Tab */}
              <Tab.Pane eventKey="profile">
                <Card>
                  <CardHeader>
                    <CardTitle as="h5" className="mb-0">Profile Information</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <Form onSubmit={handleUpdateProfile}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name *</Form.Label>
                            <Form.Control
                              type="text"
                              value={profileForm.name}
                              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control type="email" value={profile?.email || ''} disabled />
                            <Form.Text className="text-muted">Email cannot be changed</Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                              placeholder="Enter phone number"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Account Type</Form.Label>
                            <Form.Control type="text" value={user?.role?.toUpperCase() || ''} disabled />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Button type="submit" variant="primary" disabled={isUpdatingProfile}>
                        {isUpdatingProfile ? <Spinner size="sm" className="me-2" /> : null}
                        Update Profile
                      </Button>
                    </Form>
                  </CardBody>
                </Card>
              </Tab.Pane>

              {/* Password Tab */}
              <Tab.Pane eventKey="password">
                <Card>
                  <CardHeader>
                    <CardTitle as="h5" className="mb-0">Change Password</CardTitle>
                  </CardHeader>
                  <CardBody>
                    {profile?.authProvider !== 'local' ? (
                      <Alert variant="info">
                        Password change is not available for {profile?.authProvider === 'google' ? 'Google' : 'Phone OTP'} login accounts.
                      </Alert>
                    ) : (
                      <Form onSubmit={handleChangePassword}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Current Password *</Form.Label>
                              <InputGroup>
                                <Form.Control
                                  type={showCurrentPassword ? 'text' : 'password'}
                                  value={passwordForm.currentPassword}
                                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                  required
                                />
                                <Button variant="outline-secondary" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                </Button>
                              </InputGroup>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>New Password *</Form.Label>
                              <InputGroup>
                                <Form.Control
                                  type={showNewPassword ? 'text' : 'password'}
                                  value={passwordForm.newPassword}
                                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                  required
                                  minLength={6}
                                />
                                <Button variant="outline-secondary" onClick={() => setShowNewPassword(!showNewPassword)}>
                                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                </Button>
                              </InputGroup>
                              <Form.Text className="text-muted">Minimum 6 characters</Form.Text>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Confirm New Password *</Form.Label>
                              <Form.Control
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                required
                                isInvalid={passwordForm.confirmPassword !== '' && passwordForm.newPassword !== passwordForm.confirmPassword}
                              />
                              <Form.Control.Feedback type="invalid">Passwords do not match</Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Button type="submit" variant="primary" disabled={isChangingPassword}>
                          {isChangingPassword ? <Spinner size="sm" className="me-2" /> : null}
                          Change Password
                        </Button>
                      </Form>
                    )}
                  </CardBody>
                </Card>
              </Tab.Pane>

              {/* Bank Details Tab (Vendor Only) */}
              {isVendor && (
                <Tab.Pane eventKey="bank">
                  <Card>
                    <CardHeader>
                      <CardTitle as="h5" className="mb-0">Bank Account Details</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <Alert variant="info" className="mb-4">
                        <strong>Note:</strong> Please ensure your bank details are correct. These details will be used for processing your withdrawal requests.
                      </Alert>
                      <Form onSubmit={handleUpdateBankDetails}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Account Holder Name *</Form.Label>
                              <Form.Control
                                type="text"
                                value={bankForm.accountHolderName}
                                onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                                required
                                placeholder="As per bank records"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Bank Name *</Form.Label>
                              <Form.Control
                                type="text"
                                value={bankForm.bankName}
                                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                                required
                                placeholder="e.g., State Bank of India"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Account Number *</Form.Label>
                              <Form.Control
                                type="text"
                                value={bankForm.accountNumber}
                                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                                required
                                placeholder="Enter account number"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>IFSC Code *</Form.Label>
                              <Form.Control
                                type="text"
                                value={bankForm.ifscCode}
                                onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                                required
                                placeholder="e.g., SBIN0001234"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Branch Name</Form.Label>
                              <Form.Control
                                type="text"
                                value={bankForm.branchName}
                                onChange={(e) => setBankForm({ ...bankForm, branchName: e.target.value })}
                                placeholder="Enter branch name"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>UPI ID (Optional)</Form.Label>
                              <Form.Control
                                type="text"
                                value={bankForm.upiId}
                                onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                                placeholder="yourname@upi"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <div className="d-flex gap-2">
                          <Button type="submit" variant="primary" disabled={isUpdatingBank || isDeletingBank}>
                            {isUpdatingBank ? <Spinner size="sm" className="me-2" /> : null}
                            Save Bank Details
                          </Button>
                          {walletStats?.wallet?.bankDetails?.accountNumber && (
                            <Button
                              type="button"
                              variant="outline-danger"
                              disabled={isUpdatingBank || isDeletingBank}
                              onClick={handleDeleteBankDetails}
                            >
                              {isDeletingBank ? <Spinner size="sm" className="me-2" /> : null}
                              Delete Bank Details
                            </Button>
                          )}
                        </div>
                      </Form>
                    </CardBody>
                  </Card>
                </Tab.Pane>
              )}

              {/* Withdrawal Request Tab (Vendor Only) */}
              {isVendor && (
                <Tab.Pane eventKey="withdrawal">
                  <Row>
                    <Col lg={8}>
                      <Card>
                        <CardHeader>
                          <CardTitle as="h5" className="mb-0">Request Withdrawal</CardTitle>
                        </CardHeader>
                        <CardBody>
                          {walletLoading ? (
                            <div className="text-center py-4">
                              <Spinner animation="border" size="sm" />
                            </div>
                          ) : !hasBankDetails ? (
                            <Alert variant="warning">
                              <strong>Bank details required!</strong> Please add your bank details before requesting a withdrawal.
                              <Button variant="link" className="p-0 ms-2" onClick={() => setActiveTab('bank')}>
                                Add Bank Details
                              </Button>
                            </Alert>
                          ) : (
                            <Form onSubmit={handleRequestWithdrawal}>
                              <Alert variant="info" className="mb-4">
                                <small>
                                  <strong>Note:</strong> Minimum withdrawal is ₹100. Withdrawals are processed within 24-48 hours.
                                  Only one pending withdrawal request is allowed at a time.
                                </small>
                              </Alert>

                              <Row className="mb-4">
                                <Col sm={6}>
                                  <div className="p-3 bg-success bg-opacity-10 rounded">
                                    <small className="text-muted d-block">Available Balance</small>
                                    <h4 className="text-success mb-0">{formatCurrency(walletStats?.wallet?.balance || 0)}</h4>
                                  </div>
                                </Col>
                                <Col sm={6}>
                                  <div className="p-3 bg-warning bg-opacity-10 rounded">
                                    <small className="text-muted d-block">Pending (7-day hold)</small>
                                    <h4 className="text-warning mb-0">{formatCurrency(walletStats?.wallet?.pendingBalance || 0)}</h4>
                                  </div>
                                </Col>
                              </Row>

                              <Form.Group className="mb-3">
                                <Form.Label>Withdrawal Amount (₹) *</Form.Label>
                                <Form.Control
                                  type="number"
                                  value={withdrawAmount}
                                  onChange={(e) => setWithdrawAmount(e.target.value)}
                                  min={100}
                                  max={walletStats?.wallet?.balance || 0}
                                  placeholder="Enter amount"
                                  required
                                />
                                <Form.Text className="text-muted">
                                  Minimum: ₹100 | Maximum: {formatCurrency(walletStats?.wallet?.balance || 0)}
                                </Form.Text>
                              </Form.Group>

                              <div className="mb-3 p-3 bg-light rounded">
                                <small className="text-muted d-block mb-1">Funds will be transferred to:</small>
                                <strong>{walletStats?.wallet?.bankDetails?.bankName}</strong>
                                <span className="mx-2">•</span>
                                A/C: ****{walletStats?.wallet?.bankDetails?.accountNumber?.slice(-4)}
                              </div>

                              <Button
                                type="submit"
                                variant="success"
                                disabled={isRequestingWithdrawal || !walletStats?.wallet?.balance || walletStats.wallet.balance < 100}
                              >
                                {isRequestingWithdrawal ? <Spinner size="sm" className="me-2" /> : null}
                                Request Withdrawal
                              </Button>
                            </Form>
                          )}
                        </CardBody>
                      </Card>
                    </Col>
                    <Col lg={4}>
                      <Card>
                        <CardHeader>
                          <CardTitle as="h6" className="mb-0">Earnings Summary</CardTitle>
                        </CardHeader>
                        <CardBody>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Today</span>
                            <strong>{formatCurrency(walletStats?.earnings?.daily || 0)}</strong>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">This Week</span>
                            <strong>{formatCurrency(walletStats?.earnings?.weekly || 0)}</strong>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">This Month</span>
                            <strong>{formatCurrency(walletStats?.earnings?.monthly || 0)}</strong>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Total Earnings</span>
                            <strong className="text-success">{formatCurrency(walletStats?.wallet?.totalEarnings || 0)}</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Total Withdrawn</span>
                            <strong>{formatCurrency(walletStats?.wallet?.totalWithdrawn || 0)}</strong>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </Tab.Pane>
              )}

              {/* Withdrawal History Tab (Vendor Only) */}
              {isVendor && (
                <Tab.Pane eventKey="history">
                  <Card>
                    <CardHeader className="d-flex justify-content-between align-items-center">
                      <CardTitle as="h5" className="mb-0">Recent Withdrawals</CardTitle>
                      <Button variant="outline-primary" size="sm" href="/wallet/withdrawals">
                        View All
                      </Button>
                    </CardHeader>
                    <CardBody>
                      {withdrawalsLoading ? (
                        <div className="text-center py-4">
                          <Spinner animation="border" size="sm" />
                        </div>
                      ) : withdrawalsData?.data && withdrawalsData.data.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {withdrawalsData.data.map((w: any) => (
                                <tr key={w._id}>
                                  <td>{formatDate(w.createdAt)}</td>
                                  <td className="fw-bold">{formatCurrency(w.amount)}</td>
                                  <td>
                                    <Badge
                                      bg={
                                        w.status === 'completed' ? 'success' :
                                        w.status === 'pending' ? 'warning' :
                                        w.status === 'processing' ? 'info' :
                                        w.status === 'failed' ? 'danger' : 'secondary'
                                      }
                                    >
                                      {w.status}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted">
                          <FaHistory size={32} className="mb-2 opacity-50" />
                          <p>No withdrawal history yet</p>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </Tab.Pane>
              )}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  )
}

export default VendorProfile
