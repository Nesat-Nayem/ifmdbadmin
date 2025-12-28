'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Table,
  Badge,
  Button,
  Spinner,
  Nav,
  Tab,
  Pagination,
} from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetDashboardStatsQuery, useGetAllTransactionsQuery, useGetVideoPurchasesQuery, useGetVendorRegistrationsQuery } from '@/store/dashboardApi'

// Dynamic import for ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const DashboardStats = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [transactionPage, setTransactionPage] = useState(1)
  const [videoPurchasePage, setVideoPurchasePage] = useState(1)
  const [vendorRegPage, setVendorRegPage] = useState(1)

  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useGetDashboardStatsQuery()
  const { data: transactionsData, isLoading: transactionsLoading } = useGetAllTransactionsQuery({ page: transactionPage, limit: 10 })
  const { data: videoPurchasesData, isLoading: videoPurchasesLoading } = useGetVideoPurchasesQuery({ page: videoPurchasePage, limit: 10 })
  const { data: vendorRegsData, isLoading: vendorRegsLoading } = useGetVendorRegistrationsQuery({ page: vendorRegPage, limit: 10 })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      pending: { bg: 'warning', text: 'Pending' },
      processing: { bg: 'info', text: 'Processing' },
      completed: { bg: 'success', text: 'Completed' },
      failed: { bg: 'danger', text: 'Failed' },
      approved: { bg: 'success', text: 'Approved' },
      rejected: { bg: 'danger', text: 'Rejected' },
    }
    const badge = badges[status] || { bg: 'secondary', text: status }
    return <Badge bg={badge.bg}>{badge.text}</Badge>
  }

  if (statsLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading dashboard...</p>
      </Container>
    )
  }

  if (statsError || !dashboardStats) {
    return (
      <Container className="text-center py-5">
        <IconifyIcon icon="bx:error-circle" className="fs-1 text-danger" />
        <p className="mt-3">Failed to load dashboard data</p>
      </Container>
    )
  }

  const isAdmin = dashboardStats.role === 'admin'
  const stats = dashboardStats

  // Prepare chart data for monthly trend
  const monthlyTrendData = stats.monthlyTrend || []
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const trendLabels = monthlyTrendData.map((item: any) => {
    if (typeof item._id === 'object') {
      return `${monthNames[item._id.month - 1]} ${item._id.year}`
    }
    return item._id
  })
  const trendValues = monthlyTrendData.map((item: any) => item.total)

  // Prepare chart data for daily trend
  const dailyTrendData = stats.dailyTrend || []
  const dailyLabels = dailyTrendData.map((item: any) => item._id)
  const dailyValues = dailyTrendData.map((item: any) => item.total)

  // Prepare pie chart data for service breakdown
  const serviceBreakdown = stats.serviceBreakdown || {}
  const pieLabels = Object.keys(serviceBreakdown).map((key) => {
    if (key === 'events') return '🎭 Events'
    if (key === 'movie_watch') return '🎬 Watch Videos'
    if (key === 'film_trade') return '🎞️ Film Trade'
    return key
  })
  const pieValues = Object.values(serviceBreakdown).map((item: any) => item.total)

  // Chart options
  const areaChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
    xaxis: { categories: trendLabels },
    yaxis: {
      labels: {
        formatter: (value: number) => formatCurrency(value),
      },
    },
    colors: ['#6366f1'],
    tooltip: {
      y: {
        formatter: (value: number) => formatCurrency(value),
      },
    },
  }

  const dailyChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '60%',
      },
    },
    dataLabels: { enabled: false },
    xaxis: { 
      categories: dailyLabels,
      labels: {
        rotate: -45,
        style: { fontSize: '10px' },
      },
    },
    yaxis: {
      labels: {
        formatter: (value: number) => formatCurrency(value),
      },
    },
    colors: ['#10b981'],
    tooltip: {
      y: {
        formatter: (value: number) => formatCurrency(value),
      },
    },
  }

  const pieChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut' },
    labels: pieLabels,
    colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'],
    legend: { position: 'bottom' },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => formatCurrency(pieValues.reduce((a: number, b: number) => a + b, 0)),
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => formatCurrency(value),
      },
    },
  }

  return (
    <Container fluid className="px-0">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            {isAdmin ? '🎬 Film Mart Platform Dashboard' : '📊 Vendor Dashboard'}
          </h4>
          <p className="text-muted mb-0">
            {isAdmin ? 'Complete platform analytics and insights' : 'Your performance metrics and earnings'}
          </p>
        </div>
        <Badge bg="primary" className="px-3 py-2">
          <IconifyIcon icon="bx:refresh" className="me-1" />
          Real-time Data
        </Badge>
      </div>

      {/* Main Stats Cards */}
      <Row className="g-3 mb-4">
        {/* Content Stats */}
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardBody className="text-white">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-1 opacity-75">Film Trade Movies</p>
                  <h2 className="mb-0 fw-bold">{stats.contentStats.totalMovies}</h2>
                  <small className="opacity-75">{stats.contentStats.activeMovies} active</small>
                </div>
                <div className="bg-white bg-opacity-25 rounded-circle p-3">
                  <IconifyIcon icon="bx:movie" className="fs-3" />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardBody className="text-white">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-1 opacity-75">Total Events</p>
                  <h2 className="mb-0 fw-bold">{stats.contentStats.totalEvents}</h2>
                  <small className="opacity-75">{stats.contentStats.activeEvents} active</small>
                </div>
                <div className="bg-white bg-opacity-25 rounded-circle p-3">
                  <IconifyIcon icon="bx:calendar-event" className="fs-3" />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardBody className="text-white">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-1 opacity-75">Watch Videos</p>
                  <h2 className="mb-0 fw-bold">{stats.contentStats.totalWatchVideos}</h2>
                  <small className="opacity-75">{stats.contentStats.activeWatchVideos} active</small>
                </div>
                <div className="bg-white bg-opacity-25 rounded-circle p-3">
                  <IconifyIcon icon="bx:play-circle" className="fs-3" />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <CardBody className="text-white">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-1 opacity-75">Channels</p>
                  <h2 className="mb-0 fw-bold">{stats.contentStats.totalChannels}</h2>
                  <small className="opacity-75">Streaming channels</small>
                </div>
                <div className="bg-white bg-opacity-25 rounded-circle p-3">
                  <IconifyIcon icon="bx:tv" className="fs-3" />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Revenue Stats */}
      <Row className="g-3 mb-4">
        {isAdmin ? (
          <>
            <Col xl={3} md={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Total Platform Revenue</p>
                      <h3 className="text-success mb-0 fw-bold">{formatCurrency(stats.revenueData.totalPlatformRevenue || 0)}</h3>
                    </div>
                    <div className="bg-success bg-opacity-10 rounded-circle p-3">
                      <IconifyIcon icon="bx:rupee" className="fs-3 text-success" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={3} md={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Today&apos;s Revenue</p>
                      <h3 className="text-primary mb-0 fw-bold">{formatCurrency(stats.revenueData.dailyRevenue || 0)}</h3>
                    </div>
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                      <IconifyIcon icon="bx:calendar-check" className="fs-3 text-primary" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={3} md={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Monthly Revenue</p>
                      <h3 className="text-info mb-0 fw-bold">{formatCurrency(stats.revenueData.monthlyRevenue || 0)}</h3>
                    </div>
                    <div className="bg-info bg-opacity-10 rounded-circle p-3">
                      <IconifyIcon icon="bx:calendar" className="fs-3 text-info" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={3} md={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Yearly Revenue</p>
                      <h3 className="text-warning mb-0 fw-bold">{formatCurrency(stats.revenueData.yearlyRevenue || 0)}</h3>
                    </div>
                    <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                      <IconifyIcon icon="bx:trending-up" className="fs-3 text-warning" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </>
        ) : (
          <>
            <Col xl={3} md={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Available Balance</p>
                      <h3 className="text-success mb-0 fw-bold">{formatCurrency(stats.revenueData.walletBalance || 0)}</h3>
                    </div>
                    <div className="bg-success bg-opacity-10 rounded-circle p-3">
                      <IconifyIcon icon="bx:wallet" className="fs-3 text-success" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={3} md={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Pending Balance</p>
                      <h3 className="text-warning mb-0 fw-bold">{formatCurrency(stats.revenueData.pendingBalance || 0)}</h3>
                    </div>
                    <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                      <IconifyIcon icon="bx:time" className="fs-3 text-warning" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={3} md={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Total Earnings</p>
                      <h3 className="text-primary mb-0 fw-bold">{formatCurrency(stats.revenueData.totalEarnings || 0)}</h3>
                    </div>
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                      <IconifyIcon icon="bx:rupee" className="fs-3 text-primary" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={3} md={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Total Withdrawn</p>
                      <h3 className="text-info mb-0 fw-bold">{formatCurrency(stats.revenueData.totalWithdrawn || 0)}</h3>
                    </div>
                    <div className="bg-info bg-opacity-10 rounded-circle p-3">
                      <IconifyIcon icon="bx:send" className="fs-3 text-info" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Admin-specific stats */}
      {isAdmin && stats.vendorStats && (
        <Row className="g-3 mb-4">
          <Col xl={3} md={6}>
            <Card className="border-0 shadow-sm h-100 border-start border-primary border-4">
              <CardBody>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">Total Vendors</p>
                    <h3 className="mb-0 fw-bold">{stats.vendorStats.totalVendors}</h3>
                  </div>
                  <IconifyIcon icon="bx:store" className="fs-1 text-primary opacity-50" />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl={3} md={6}>
            <Card className="border-0 shadow-sm h-100 border-start border-warning border-4">
              <CardBody>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">Pending Applications</p>
                    <h3 className="mb-0 fw-bold text-warning">{stats.vendorStats.pendingVendorApplications}</h3>
                  </div>
                  <IconifyIcon icon="bx:user-plus" className="fs-1 text-warning opacity-50" />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl={3} md={6}>
            <Card className="border-0 shadow-sm h-100 border-start border-danger border-4">
              <CardBody>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">Pending Withdrawals</p>
                    <h3 className="mb-0 fw-bold text-danger">{stats.vendorStats.pendingWithdrawals}</h3>
                  </div>
                  <IconifyIcon icon="bx:credit-card" className="fs-1 text-danger opacity-50" />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl={3} md={6}>
            <Card className="border-0 shadow-sm h-100 border-start border-success border-4">
              <CardBody>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">Vendor Payouts</p>
                    <h3 className="mb-0 fw-bold text-success">{formatCurrency(stats.vendorStats.totalVendorPayouts)}</h3>
                  </div>
                  <IconifyIcon icon="bx:money" className="fs-1 text-success opacity-50" />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* User Stats (Admin) */}
      {isAdmin && stats.userStats && (
        <Row className="g-3 mb-4">
          <Col xl={3} md={6}>
            <Card className="border-0 shadow-sm">
              <CardBody className="text-center">
                <IconifyIcon icon="bx:group" className="fs-1 text-primary mb-2" />
                <h4 className="mb-0">{stats.userStats.totalUsers}</h4>
                <small className="text-muted">Total Users</small>
              </CardBody>
            </Card>
          </Col>
          <Col xl={3} md={6}>
            <Card className="border-0 shadow-sm">
              <CardBody className="text-center">
                <IconifyIcon icon="bx:user" className="fs-1 text-info mb-2" />
                <h4 className="mb-0">{stats.userStats.totalCustomers}</h4>
                <small className="text-muted">Customers</small>
              </CardBody>
            </Card>
          </Col>
          <Col xl={3} md={6}>
            <Card className="border-0 shadow-sm">
              <CardBody className="text-center">
                <IconifyIcon icon="bx:user-plus" className="fs-1 text-success mb-2" />
                <h4 className="mb-0">{stats.userStats.newUsersToday}</h4>
                <small className="text-muted">New Today</small>
              </CardBody>
            </Card>
          </Col>
          <Col xl={3} md={6}>
            <Card className="border-0 shadow-sm">
              <CardBody className="text-center">
                <IconifyIcon icon="bx:calendar-plus" className="fs-1 text-warning mb-2" />
                <h4 className="mb-0">{stats.userStats.newUsersThisMonth}</h4>
                <small className="text-muted">New This Month</small>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Charts Row */}
      <Row className="g-3 mb-4">
        <Col xl={8}>
          <Card className="border-0 shadow-sm h-100">
            <CardHeader className="bg-transparent border-0">
              <CardTitle as="h5" className="mb-0">
                <IconifyIcon icon="bx:line-chart" className="me-2 text-primary" />
                Revenue Trend (Last 12 Months)
              </CardTitle>
            </CardHeader>
            <CardBody>
              {monthlyTrendData.length > 0 ? (
                <Chart
                  options={areaChartOptions}
                  series={[{ name: 'Revenue', data: trendValues }]}
                  type="area"
                  height={350}
                />
              ) : (
                <div className="text-center py-5 text-muted">
                  <IconifyIcon icon="bx:chart" className="fs-1 mb-2" />
                  <p>No trend data available</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
        <Col xl={4}>
          <Card className="border-0 shadow-sm h-100">
            <CardHeader className="bg-transparent border-0">
              <CardTitle as="h5" className="mb-0">
                <IconifyIcon icon="bx:pie-chart-alt-2" className="me-2 text-primary" />
                Revenue by Service
              </CardTitle>
            </CardHeader>
            <CardBody>
              {pieValues.length > 0 && pieValues.some((v: number) => v > 0) ? (
                <Chart
                  options={pieChartOptions}
                  series={pieValues}
                  type="donut"
                  height={320}
                />
              ) : (
                <div className="text-center py-5 text-muted">
                  <IconifyIcon icon="bx:pie-chart" className="fs-1 mb-2" />
                  <p>No service data available</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Daily Revenue Chart */}
      <Row className="g-3 mb-4">
        <Col xl={12}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-transparent border-0">
              <CardTitle as="h5" className="mb-0">
                <IconifyIcon icon="bx:bar-chart-alt-2" className="me-2 text-success" />
                Daily Revenue (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardBody>
              {dailyTrendData.length > 0 ? (
                <Chart
                  options={dailyChartOptions}
                  series={[{ name: 'Revenue', data: dailyValues }]}
                  type="bar"
                  height={300}
                />
              ) : (
                <div className="text-center py-4 text-muted">
                  <IconifyIcon icon="bx:bar-chart" className="fs-1 mb-2" />
                  <p>No daily data available</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Tabs for Transaction History */}
      {isAdmin && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-transparent border-0">
            <Nav variant="tabs" className="border-0">
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'overview'} 
                  onClick={() => setActiveTab('overview')}
                  className="border-0"
                >
                  <IconifyIcon icon="bx:history" className="me-1" />
                  Recent Transactions
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'all-transactions'} 
                  onClick={() => setActiveTab('all-transactions')}
                  className="border-0"
                >
                  <IconifyIcon icon="bx:list-ul" className="me-1" />
                  All Transactions
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'video-purchases'} 
                  onClick={() => setActiveTab('video-purchases')}
                  className="border-0"
                >
                  <IconifyIcon icon="bx:play-circle" className="me-1" />
                  Video Purchases
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'vendor-registrations'} 
                  onClick={() => setActiveTab('vendor-registrations')}
                  className="border-0"
                >
                  <IconifyIcon icon="bx:store" className="me-1" />
                  Vendor Registrations
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </CardHeader>
          <CardBody>
            {/* Recent Transactions Tab */}
            {activeTab === 'overview' && (
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                    stats.recentTransactions.map((txn: any) => (
                      <tr key={txn._id}>
                        <td><small>{formatDate(txn.createdAt)}</small></td>
                        <td>
                          {txn.userId?.name || 'N/A'}
                          <small className="d-block text-muted">{txn.userId?.email || ''}</small>
                        </td>
                        <td>
                          <Badge bg={txn.type === 'platform_fee' ? 'success' : txn.type === 'debit' ? 'danger' : 'primary'}>
                            {txn.type?.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td>
                          <small>
                            {txn.serviceType === 'events' && '🎭 Events'}
                            {txn.serviceType === 'movie_watch' && '🎬 Video'}
                            {!txn.serviceType && '-'}
                          </small>
                        </td>
                        <td className="fw-bold text-success">{formatCurrency(txn.amount)}</td>
                        <td>{getStatusBadge(txn.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">
                        No recent transactions
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}

            {/* All Transactions Tab */}
            {activeTab === 'all-transactions' && (
              <>
                {transactionsLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : (
                  <>
                    <Table responsive hover className="mb-3">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>User</th>
                          <th>Type</th>
                          <th>Service</th>
                          <th>Amount</th>
                          <th>Description</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactionsData?.data && transactionsData.data.length > 0 ? (
                          transactionsData.data.map((txn) => (
                            <tr key={txn._id}>
                              <td><small>{formatDate(txn.createdAt)}</small></td>
                              <td>
                                {txn.userId?.name || 'N/A'}
                                <small className="d-block text-muted">{txn.userId?.email || ''}</small>
                              </td>
                              <td>
                                <Badge bg={txn.type === 'platform_fee' ? 'success' : txn.type === 'debit' ? 'danger' : 'primary'}>
                                  {txn.type?.replace('_', ' ')}
                                </Badge>
                              </td>
                              <td><small>{txn.serviceType || '-'}</small></td>
                              <td className="fw-bold">{formatCurrency(txn.amount)}</td>
                              <td><small className="text-muted">{txn.description}</small></td>
                              <td>{getStatusBadge(txn.status)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="text-center py-4 text-muted">
                              No transactions found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                    {transactionsData?.meta && transactionsData.meta.totalPages > 1 && (
                      <div className="d-flex justify-content-end">
                        <Pagination className="mb-0">
                          <Pagination.Prev 
                            onClick={() => setTransactionPage(transactionPage - 1)} 
                            disabled={transactionPage === 1} 
                          />
                          <Pagination.Item active>{transactionPage} / {transactionsData.meta.totalPages}</Pagination.Item>
                          <Pagination.Next 
                            onClick={() => setTransactionPage(transactionPage + 1)} 
                            disabled={transactionPage === transactionsData.meta.totalPages} 
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Video Purchases Tab */}
            {activeTab === 'video-purchases' && (
              <>
                {videoPurchasesLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : (
                  <>
                    {videoPurchasesData?.meta && (
                      <div className="mb-3 p-3 bg-light rounded">
                        <strong>Total Revenue:</strong> {formatCurrency(videoPurchasesData.meta.totalRevenue)}
                        <span className="ms-3"><strong>Total Purchases:</strong> {videoPurchasesData.meta.total}</span>
                      </div>
                    )}
                    <Table responsive hover className="mb-3">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Customer</th>
                          <th>Video</th>
                          <th>Amount</th>
                          <th>Payment Method</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {videoPurchasesData?.data && videoPurchasesData.data.length > 0 ? (
                          videoPurchasesData.data.map((purchase) => (
                            <tr key={purchase._id}>
                              <td><small>{formatDate(purchase.purchasedAt)}</small></td>
                              <td>
                                {purchase.userId?.name || 'N/A'}
                                <small className="d-block text-muted">{purchase.userId?.email || ''}</small>
                              </td>
                              <td>
                                <small>{purchase.videoId?.title || 'N/A'}</small>
                              </td>
                              <td className="fw-bold text-success">{formatCurrency(purchase.amount)}</td>
                              <td><Badge bg="secondary">{purchase.paymentMethod}</Badge></td>
                              <td>{getStatusBadge(purchase.paymentStatus)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-4 text-muted">
                              No video purchases found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                    {videoPurchasesData?.meta && videoPurchasesData.meta.totalPages > 1 && (
                      <div className="d-flex justify-content-end">
                        <Pagination className="mb-0">
                          <Pagination.Prev 
                            onClick={() => setVideoPurchasePage(videoPurchasePage - 1)} 
                            disabled={videoPurchasePage === 1} 
                          />
                          <Pagination.Item active>{videoPurchasePage} / {videoPurchasesData.meta.totalPages}</Pagination.Item>
                          <Pagination.Next 
                            onClick={() => setVideoPurchasePage(videoPurchasePage + 1)} 
                            disabled={videoPurchasePage === videoPurchasesData.meta.totalPages} 
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Vendor Registrations Tab */}
            {activeTab === 'vendor-registrations' && (
              <>
                {vendorRegsLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : (
                  <>
                    {vendorRegsData?.meta && (
                      <div className="mb-3 p-3 bg-light rounded">
                        <strong>Total Payments:</strong> {formatCurrency(vendorRegsData.meta.totalPayments)}
                        <span className="ms-3"><strong>Paid Registrations:</strong> {vendorRegsData.meta.paidCount}</span>
                      </div>
                    )}
                    <Table responsive hover className="mb-3">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Vendor Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Payment</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendorRegsData?.data && vendorRegsData.data.length > 0 ? (
                          vendorRegsData.data.map((vendor) => (
                            <tr key={vendor._id}>
                              <td><small>{formatDate(vendor.createdAt)}</small></td>
                              <td><strong>{vendor.vendorName}</strong></td>
                              <td><small>{vendor.email}</small></td>
                              <td><small>{vendor.phone}</small></td>
                              <td>
                                {vendor.paymentInfo?.amount ? (
                                  <span className="text-success fw-bold">
                                    {formatCurrency(vendor.paymentInfo.amount)}
                                  </span>
                                ) : (
                                  <Badge bg="secondary">Free</Badge>
                                )}
                              </td>
                              <td>{getStatusBadge(vendor.status)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-4 text-muted">
                              No vendor registrations found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                    {vendorRegsData?.meta && vendorRegsData.meta.totalPages > 1 && (
                      <div className="d-flex justify-content-end">
                        <Pagination className="mb-0">
                          <Pagination.Prev 
                            onClick={() => setVendorRegPage(vendorRegPage - 1)} 
                            disabled={vendorRegPage === 1} 
                          />
                          <Pagination.Item active>{vendorRegPage} / {vendorRegsData.meta.totalPages}</Pagination.Item>
                          <Pagination.Next 
                            onClick={() => setVendorRegPage(vendorRegPage + 1)} 
                            disabled={vendorRegPage === vendorRegsData.meta.totalPages} 
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </CardBody>
        </Card>
      )}

      {/* Vendor Recent Transactions */}
      {!isAdmin && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-transparent border-0">
            <CardTitle as="h5" className="mb-0">
              <IconifyIcon icon="bx:history" className="me-2" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((txn: any) => (
                    <tr key={txn._id}>
                      <td><small>{formatDate(txn.createdAt)}</small></td>
                      <td>
                        <Badge bg={txn.type === 'credit' ? 'success' : txn.type === 'debit' ? 'danger' : 'primary'}>
                          {txn.type?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>
                        <small>
                          {txn.serviceType === 'events' && '🎭 Events'}
                          {txn.serviceType === 'movie_watch' && '🎬 Video'}
                          {!txn.serviceType && '-'}
                        </small>
                      </td>
                      <td className={`fw-bold ${txn.type === 'debit' ? 'text-danger' : 'text-success'}`}>
                        {txn.type === 'debit' ? '-' : '+'}{formatCurrency(txn.netAmount || txn.amount)}
                      </td>
                      <td><small className="text-muted">{txn.description}</small></td>
                      <td>{getStatusBadge(txn.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No recent transactions
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}
    </Container>
  )
}

export default DashboardStats
