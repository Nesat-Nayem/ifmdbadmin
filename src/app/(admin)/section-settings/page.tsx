'use client'
import React, { useState } from 'react'
import { Card, Row, Col, Button, Form, Spinner, Alert, Tab, Tabs, Badge, Accordion, Modal } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { toast } from 'react-toastify'
import {
  useGetSectionDividersQuery,
  useGetSectionTitlesQuery,
  useCreateSectionDividerMutation,
  useUpdateSectionDividerMutation,
  useDeleteSectionDividerMutation,
  useCreateSectionTitleMutation,
  useUpdateSectionTitleMutation,
  useDeleteSectionTitleMutation,
  useSeedDefaultSettingsMutation,
  ISectionDivider,
  ISectionTitle
} from '@/store/sectionSettingsApi'

// Local type for form state (without createdAt/updatedAt)
type SectionDividerForm = Omit<ISectionDivider, 'createdAt' | 'updatedAt'>
type SectionTitleForm = Omit<ISectionTitle, 'createdAt' | 'updatedAt'>

interface SectionTitle {
  _id: string
  sectionKey: string
  parentDivider: string
  title: string
  icon: string
  viewMoreLink: string
  isActive: boolean
  order: number
  style: {
    textColor: string
    textGradientEnabled: boolean
    gradientFrom: string
    gradientVia: string
    gradientTo: string
    fontSize: string
    fontWeight: string
    iconColor: string
    iconSize: string
    iconPosition: string
    backgroundColor: string
    backgroundOpacity: number
    borderRadius: string
    borderColor: string
    borderWidth: string
    paddingY: string
    paddingX: string
    marginBottom: string
    accentEnabled: boolean
    accentColor: string
    accentWidth: string
    accentPosition: string
    hoverEffect: string
    hoverColor: string
  }
}

const fontSizeOptions = [
  { value: 'text-xs', label: 'Extra Small' },
  { value: 'text-sm', label: 'Small' },
  { value: 'text-base', label: 'Base' },
  { value: 'text-lg', label: 'Large' },
  { value: 'text-xl', label: 'Extra Large' },
  { value: 'text-2xl', label: '2XL' },
  { value: 'text-3xl', label: '3XL' },
  { value: 'text-4xl', label: '4XL' },
]

const fontWeightOptions = [
  { value: 'font-normal', label: 'Normal' },
  { value: 'font-medium', label: 'Medium' },
  { value: 'font-semibold', label: 'Semi Bold' },
  { value: 'font-bold', label: 'Bold' },
  { value: 'font-extrabold', label: 'Extra Bold' },
]

const gradientDirections = [
  { value: 'to-r', label: 'Left to Right' },
  { value: 'to-l', label: 'Right to Left' },
  { value: 'to-t', label: 'Bottom to Top' },
  { value: 'to-b', label: 'Top to Bottom' },
  { value: 'to-tr', label: 'To Top Right' },
  { value: 'to-tl', label: 'To Top Left' },
  { value: 'to-br', label: 'To Bottom Right' },
  { value: 'to-bl', label: 'To Bottom Left' },
]

const hoverEffects = [
  { value: 'none', label: 'None' },
  { value: 'scale', label: 'Scale Up' },
  { value: 'glow', label: 'Glow' },
  { value: 'underline', label: 'Underline' },
  { value: 'color-shift', label: 'Color Shift' },
]

const SectionSettingsPage = () => {
  // RTK Query hooks
  const { data: dividers = [], isLoading: loadingDividers } = useGetSectionDividersQuery()
  const { data: titles = [], isLoading: loadingTitles } = useGetSectionTitlesQuery()
  
  const [createDivider, { isLoading: creatingDivider }] = useCreateSectionDividerMutation()
  const [updateDivider, { isLoading: updatingDivider }] = useUpdateSectionDividerMutation()
  const [deleteDividerMutation] = useDeleteSectionDividerMutation()
  
  const [createTitle, { isLoading: creatingTitle }] = useCreateSectionTitleMutation()
  const [updateTitle, { isLoading: updatingTitle }] = useUpdateSectionTitleMutation()
  const [deleteTitleMutation] = useDeleteSectionTitleMutation()
  
  const [seedDefaults, { isLoading: seeding }] = useSeedDefaultSettingsMutation()

  const [selectedDivider, setSelectedDivider] = useState<any>(null)
  const [selectedTitle, setSelectedTitle] = useState<any>(null)
  const [showDividerModal, setShowDividerModal] = useState(false)
  const [showTitleModal, setShowTitleModal] = useState(false)
  const [activeTab, setActiveTab] = useState('dividers')

  const loading = loadingDividers || loadingTitles
  const saving = creatingDivider || updatingDivider || creatingTitle || updatingTitle || seeding

  const handleSeedDefaults = async () => {
    try {
      await seedDefaults().unwrap()
      toast.success('Default settings seeded successfully')
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to seed defaults')
    }
  }

  const saveDivider = async () => {
    if (!selectedDivider) return
    try {
      if (selectedDivider._id) {
        await updateDivider({ key: selectedDivider.sectionKey, data: selectedDivider }).unwrap()
        toast.success('Divider updated successfully')
      } else {
        await createDivider(selectedDivider).unwrap()
        toast.success('Divider created successfully')
      }
      setShowDividerModal(false)
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save divider')
    }
  }

  const saveTitle = async () => {
    if (!selectedTitle) return
    try {
      if (selectedTitle._id) {
        await updateTitle({ key: selectedTitle.sectionKey, data: selectedTitle }).unwrap()
        toast.success('Title updated successfully')
      } else {
        await createTitle(selectedTitle).unwrap()
        toast.success('Title created successfully')
      }
      setShowTitleModal(false)
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save title')
    }
  }

  const deleteDivider = async (key: string) => {
    if (!confirm('Are you sure you want to delete this divider?')) return
    try {
      await deleteDividerMutation(key).unwrap()
      toast.success('Divider deleted successfully')
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete divider')
    }
  }

  const deleteTitle = async (key: string) => {
    if (!confirm('Are you sure you want to delete this title?')) return
    try {
      await deleteTitleMutation(key).unwrap()
      toast.success('Title deleted successfully')
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete title')
    }
  }

  const openDividerModal = (divider?: ISectionDivider) => {
    if (divider) {
      setSelectedDivider({ ...divider })
    } else {
      setSelectedDivider({
        _id: '',
        sectionKey: '',
        title: '',
        subtitle: '',
        icon: '',
        isActive: true,
        order: dividers.length + 1,
        style: {
          backgroundType: 'solid',
          backgroundColor: '#0a0a0a',
          gradientFrom: '#ef4444',
          gradientVia: '#f97316',
          gradientTo: '#eab308',
          gradientDirection: 'to-r',
          backgroundImage: '',
          backgroundOpacity: 100,
          titleColor: '#ffffff',
          titleGradientEnabled: true,
          titleGradientFrom: '#ef4444',
          titleGradientVia: '#f97316',
          titleGradientTo: '#eab308',
          subtitleColor: '#9ca3af',
          titleFontSize: 'text-2xl',
          titleFontWeight: 'font-bold',
          subtitleFontSize: 'text-sm',
          borderColor: '#374151',
          borderWidth: '1',
          borderStyle: 'solid',
          paddingY: '8',
          paddingX: '4',
          animation: 'none'
        }
      })
    }
    setShowDividerModal(true)
  }

  const openTitleModal = (title?: SectionTitle) => {
    if (title) {
      setSelectedTitle({ ...title })
    } else {
      setSelectedTitle({
        _id: '',
        sectionKey: '',
        parentDivider: dividers[0]?.sectionKey || '',
        title: '',
        icon: '',
        viewMoreLink: '',
        isActive: true,
        order: titles.length + 1,
        style: {
          textColor: '#ffffff',
          textGradientEnabled: false,
          gradientFrom: '#ef4444',
          gradientVia: '#f97316',
          gradientTo: '#eab308',
          fontSize: 'text-xl',
          fontWeight: 'font-bold',
          iconColor: '#ffffff',
          iconSize: 'text-xl',
          iconPosition: 'left',
          backgroundColor: 'transparent',
          backgroundOpacity: 100,
          borderRadius: '0',
          borderColor: 'transparent',
          borderWidth: '0',
          paddingY: '2',
          paddingX: '0',
          marginBottom: '4',
          accentEnabled: false,
          accentColor: '#ef4444',
          accentWidth: '2',
          accentPosition: 'bottom',
          hoverEffect: 'none',
          hoverColor: '#ef4444'
        }
      })
    }
    setShowTitleModal(true)
  }

  // Preview component for divider
  const DividerPreview = ({ divider }: { divider: any }) => {
    const { style } = divider
    
    const getGradientStyle = () => {
      if (style.titleGradientEnabled) {
        return {
          backgroundImage: `linear-gradient(to right, ${style.titleGradientFrom}, ${style.titleGradientVia}, ${style.titleGradientTo})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }
      }
      return { color: style.titleColor }
    }

    return (
      <div 
        className="w-100 py-3 px-4 rounded"
        style={{ backgroundColor: style.backgroundColor }}
      >
        <div className="position-relative">
          <div 
            className="position-absolute w-100" 
            style={{ 
              top: '50%', 
              borderTop: `${style.borderWidth}px ${style.borderStyle} ${style.borderColor}` 
            }}
          ></div>
          <div className="d-flex justify-content-center position-relative">
            <div 
              className="px-4 py-2 text-center"
              style={{ backgroundColor: style.backgroundColor }}
            >
              <h3 
                className={`${style.titleFontSize} ${style.titleFontWeight} mb-0`}
                style={getGradientStyle() as any}
              >
                {divider.title}
              </h3>
              {divider.subtitle && (
                <p 
                  className={`${style.subtitleFontSize} mt-1 mb-0`}
                  style={{ color: style.subtitleColor }}
                >
                  {divider.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Preview component for title
  const TitlePreview = ({ title }: { title: SectionTitle }) => {
    const { style } = title
    
    const getTextStyle = () => {
      if (style.textGradientEnabled) {
        return {
          backgroundImage: `linear-gradient(to right, ${style.gradientFrom}, ${style.gradientVia}, ${style.gradientTo})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }
      }
      return { color: style.textColor }
    }

    return (
      <div 
        className={`d-flex align-items-center gap-2 ${style.fontSize} ${style.fontWeight}`}
        style={{ 
          ...getTextStyle() as any,
          padding: `${style.paddingY}px ${style.paddingX}px`,
          backgroundColor: style.backgroundColor !== 'transparent' ? style.backgroundColor : undefined,
          borderRadius: `${style.borderRadius}px`,
          borderBottom: style.accentEnabled && style.accentPosition === 'bottom' 
            ? `${style.accentWidth}px solid ${style.accentColor}` 
            : undefined
        }}
      >
        {title.title}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading section settings...</p>
      </div>
    )
  }

  return (
    <>
      <PageTItle title="Section Settings" />
      
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Homepage Section Styling</h5>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={handleSeedDefaults}
              disabled={saving}
            >
              {saving ? <Spinner size="sm" /> : 'Seed Defaults'}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            Manage the styling of section dividers and section titles on your homepage. 
            Changes will be reflected on the frontend in real-time.
          </Alert>

          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'dividers')} className="mb-4">
            {/* Section Dividers Tab */}
            <Tab eventKey="dividers" title={`Section Dividers (${dividers.length})`}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="text-muted mb-0">
                  Section dividers are the major category headers (e.g., &quot;Trade Movies&quot;, &quot;Live Events&quot;)
                </p>
                <Button variant="primary" size="sm" onClick={() => openDividerModal()}>
                  + Add Divider
                </Button>
              </div>

              {dividers.length === 0 ? (
                <Alert variant="warning">No section dividers found. Click &quot;Seed Defaults&quot; to create default sections.</Alert>
              ) : (
                <Accordion>
                  {dividers.map((divider, index) => (
                    <Accordion.Item key={divider._id} eventKey={String(index)}>
                      <Accordion.Header>
                        <div className="d-flex align-items-center gap-3 w-100 me-3">
                          <Badge bg={divider.isActive ? 'success' : 'secondary'}>
                            {divider.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="fw-bold">{divider.icon} {divider.title}</span>
                          <span className="text-muted ms-auto">{divider.sectionKey}</span>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <h6>Preview</h6>
                            <div className="bg-dark rounded p-3">
                              <DividerPreview divider={divider} />
                            </div>
                          </Col>
                          <Col md={6}>
                            <h6>Details</h6>
                            <p><strong>Key:</strong> {divider.sectionKey}</p>
                            <p><strong>Subtitle:</strong> {divider.subtitle || 'None'}</p>
                            <p><strong>Order:</strong> {divider.order}</p>
                            <div className="d-flex gap-2 mt-3">
                              <Button variant="primary" size="sm" onClick={() => openDividerModal(divider)}>
                                Edit
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => deleteDivider(divider.sectionKey)}>
                                Delete
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              )}
            </Tab>

            {/* Section Titles Tab */}
            <Tab eventKey="titles" title={`Section Titles (${titles.length})`}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="text-muted mb-0">
                  Section titles are individual content section headers (e.g., &quot;Trending Events&quot;, &quot;New Release&quot;)
                </p>
                <Button variant="primary" size="sm" onClick={() => openTitleModal()}>
                  + Add Title
                </Button>
              </div>

              {titles.length === 0 ? (
                <Alert variant="warning">No section titles found. Click &quot;Seed Defaults&quot; to create default sections.</Alert>
              ) : (
                <>
                  {dividers.map(divider => {
                    const dividerTitles = titles.filter(t => t.parentDivider === divider.sectionKey)
                    if (dividerTitles.length === 0) return null
                    
                    return (
                      <Card key={divider._id} className="mb-3">
                        <Card.Header className="bg-dark text-white">
                          {divider.icon} {divider.title}
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            {dividerTitles.map(title => (
                              <Col md={6} lg={4} key={title._id} className="mb-3">
                                <Card className="h-100">
                                  <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <Badge bg={title.isActive ? 'success' : 'secondary'}>
                                        {title.isActive ? 'Active' : 'Inactive'}
                                      </Badge>
                                      <small className="text-muted">{title.sectionKey}</small>
                                    </div>
                                    <div className="bg-dark rounded p-2 mb-2">
                                      <TitlePreview title={title} />
                                    </div>
                                    <small className="text-muted d-block mb-2">
                                      Link: {title.viewMoreLink || 'None'}
                                    </small>
                                    <div className="d-flex gap-2">
                                      <Button variant="primary" size="sm" onClick={() => openTitleModal(title)}>
                                        Edit
                                      </Button>
                                      <Button variant="danger" size="sm" onClick={() => deleteTitle(title.sectionKey)}>
                                        Delete
                                      </Button>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </Card.Body>
                      </Card>
                    )
                  })}
                </>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Divider Edit Modal */}
      <Modal show={showDividerModal} onHide={() => setShowDividerModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{selectedDivider?._id ? 'Edit' : 'Create'} Section Divider</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDivider && (
            <Row>
              <Col md={6}>
                <h6>Basic Info</h6>
                <Form.Group className="mb-3">
                  <Form.Label>Section Key <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedDivider.sectionKey}
                    onChange={(e) => setSelectedDivider({...selectedDivider, sectionKey: e.target.value})}
                    placeholder="e.g., trade_movies"
                    disabled={!!selectedDivider._id}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedDivider.title}
                    onChange={(e) => setSelectedDivider({...selectedDivider, title: e.target.value})}
                    placeholder="e.g., 🎬 Trade Movies"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Subtitle</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedDivider.subtitle}
                    onChange={(e) => setSelectedDivider({...selectedDivider, subtitle: e.target.value})}
                    placeholder="e.g., Discover film rights..."
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Icon (Emoji)</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedDivider.icon}
                    onChange={(e) => setSelectedDivider({...selectedDivider, icon: e.target.value})}
                    placeholder="e.g., 🎬"
                  />
                </Form.Group>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Order</Form.Label>
                      <Form.Control
                        type="number"
                        value={selectedDivider.order}
                        onChange={(e) => setSelectedDivider({...selectedDivider, order: parseInt(e.target.value)})}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Check
                        type="switch"
                        label={selectedDivider.isActive ? 'Active' : 'Inactive'}
                        checked={selectedDivider.isActive}
                        onChange={(e) => setSelectedDivider({...selectedDivider, isActive: e.target.checked})}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <hr />
                <h6>Background Style</h6>
                <Form.Group className="mb-3">
                  <Form.Label>Background Color</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="color"
                      value={selectedDivider.style.backgroundColor}
                      onChange={(e) => setSelectedDivider({
                        ...selectedDivider, 
                        style: {...selectedDivider.style, backgroundColor: e.target.value}
                      })}
                      style={{ width: '60px' }}
                    />
                    <Form.Control
                      type="text"
                      value={selectedDivider.style.backgroundColor}
                      onChange={(e) => setSelectedDivider({
                        ...selectedDivider, 
                        style: {...selectedDivider.style, backgroundColor: e.target.value}
                      })}
                    />
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Border Color</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="color"
                      value={selectedDivider.style.borderColor}
                      onChange={(e) => setSelectedDivider({
                        ...selectedDivider, 
                        style: {...selectedDivider.style, borderColor: e.target.value}
                      })}
                      style={{ width: '60px' }}
                    />
                    <Form.Control
                      type="text"
                      value={selectedDivider.style.borderColor}
                      onChange={(e) => setSelectedDivider({
                        ...selectedDivider, 
                        style: {...selectedDivider.style, borderColor: e.target.value}
                      })}
                    />
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <h6>Title Style</h6>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    label="Enable Title Gradient"
                    checked={selectedDivider.style.titleGradientEnabled}
                    onChange={(e) => setSelectedDivider({
                      ...selectedDivider, 
                      style: {...selectedDivider.style, titleGradientEnabled: e.target.checked}
                    })}
                  />
                </Form.Group>
                
                {selectedDivider.style.titleGradientEnabled ? (
                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Gradient From</Form.Label>
                        <Form.Control
                          type="color"
                          value={selectedDivider.style.titleGradientFrom}
                          onChange={(e) => setSelectedDivider({
                            ...selectedDivider, 
                            style: {...selectedDivider.style, titleGradientFrom: e.target.value}
                          })}
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Via</Form.Label>
                        <Form.Control
                          type="color"
                          value={selectedDivider.style.titleGradientVia}
                          onChange={(e) => setSelectedDivider({
                            ...selectedDivider, 
                            style: {...selectedDivider.style, titleGradientVia: e.target.value}
                          })}
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>To</Form.Label>
                        <Form.Control
                          type="color"
                          value={selectedDivider.style.titleGradientTo}
                          onChange={(e) => setSelectedDivider({
                            ...selectedDivider, 
                            style: {...selectedDivider.style, titleGradientTo: e.target.value}
                          })}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                ) : (
                  <Form.Group className="mb-3">
                    <Form.Label>Title Color</Form.Label>
                    <Form.Control
                      type="color"
                      value={selectedDivider.style.titleColor}
                      onChange={(e) => setSelectedDivider({
                        ...selectedDivider, 
                        style: {...selectedDivider.style, titleColor: e.target.value}
                      })}
                    />
                  </Form.Group>
                )}

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Title Size</Form.Label>
                      <Form.Select
                        value={selectedDivider.style.titleFontSize}
                        onChange={(e) => setSelectedDivider({
                          ...selectedDivider, 
                          style: {...selectedDivider.style, titleFontSize: e.target.value}
                        })}
                      >
                        {fontSizeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Title Weight</Form.Label>
                      <Form.Select
                        value={selectedDivider.style.titleFontWeight}
                        onChange={(e) => setSelectedDivider({
                          ...selectedDivider, 
                          style: {...selectedDivider.style, titleFontWeight: e.target.value}
                        })}
                      >
                        {fontWeightOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Subtitle Color</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="color"
                      value={selectedDivider.style.subtitleColor}
                      onChange={(e) => setSelectedDivider({
                        ...selectedDivider, 
                        style: {...selectedDivider.style, subtitleColor: e.target.value}
                      })}
                      style={{ width: '60px' }}
                    />
                    <Form.Control
                      type="text"
                      value={selectedDivider.style.subtitleColor}
                      onChange={(e) => setSelectedDivider({
                        ...selectedDivider, 
                        style: {...selectedDivider.style, subtitleColor: e.target.value}
                      })}
                    />
                  </div>
                </Form.Group>

                <hr />
                <h6>Live Preview</h6>
                <div className="bg-dark rounded p-3">
                  <DividerPreview divider={selectedDivider} />
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDividerModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveDivider} disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Title Edit Modal */}
      <Modal show={showTitleModal} onHide={() => setShowTitleModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{selectedTitle?._id ? 'Edit' : 'Create'} Section Title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTitle && (
            <Row>
              <Col md={6}>
                <h6>Basic Info</h6>
                <Form.Group className="mb-3">
                  <Form.Label>Section Key <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedTitle.sectionKey}
                    onChange={(e) => setSelectedTitle({...selectedTitle, sectionKey: e.target.value})}
                    placeholder="e.g., trending_events"
                    disabled={!!selectedTitle._id}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Parent Divider <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={selectedTitle.parentDivider}
                    onChange={(e) => setSelectedTitle({...selectedTitle, parentDivider: e.target.value})}
                  >
                    {dividers.map(d => (
                      <option key={d._id} value={d.sectionKey}>{d.title}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedTitle.title}
                    onChange={(e) => setSelectedTitle({...selectedTitle, title: e.target.value})}
                    placeholder="e.g., 🔥 Trending Events"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Icon (Emoji)</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedTitle.icon}
                    onChange={(e) => setSelectedTitle({...selectedTitle, icon: e.target.value})}
                    placeholder="e.g., 🔥"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>View More Link</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedTitle.viewMoreLink}
                    onChange={(e) => setSelectedTitle({...selectedTitle, viewMoreLink: e.target.value})}
                    placeholder="e.g., /events?section=trending_events"
                  />
                </Form.Group>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Order</Form.Label>
                      <Form.Control
                        type="number"
                        value={selectedTitle.order}
                        onChange={(e) => setSelectedTitle({...selectedTitle, order: parseInt(e.target.value)})}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Check
                        type="switch"
                        label={selectedTitle.isActive ? 'Active' : 'Inactive'}
                        checked={selectedTitle.isActive}
                        onChange={(e) => setSelectedTitle({...selectedTitle, isActive: e.target.checked})}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col md={6}>
                <h6>Text Style</h6>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    label="Enable Text Gradient"
                    checked={selectedTitle.style.textGradientEnabled}
                    onChange={(e) => setSelectedTitle({
                      ...selectedTitle, 
                      style: {...selectedTitle.style, textGradientEnabled: e.target.checked}
                    })}
                  />
                </Form.Group>
                
                {selectedTitle.style.textGradientEnabled ? (
                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>From</Form.Label>
                        <Form.Control
                          type="color"
                          value={selectedTitle.style.gradientFrom}
                          onChange={(e) => setSelectedTitle({
                            ...selectedTitle, 
                            style: {...selectedTitle.style, gradientFrom: e.target.value}
                          })}
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Via</Form.Label>
                        <Form.Control
                          type="color"
                          value={selectedTitle.style.gradientVia}
                          onChange={(e) => setSelectedTitle({
                            ...selectedTitle, 
                            style: {...selectedTitle.style, gradientVia: e.target.value}
                          })}
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>To</Form.Label>
                        <Form.Control
                          type="color"
                          value={selectedTitle.style.gradientTo}
                          onChange={(e) => setSelectedTitle({
                            ...selectedTitle, 
                            style: {...selectedTitle.style, gradientTo: e.target.value}
                          })}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                ) : (
                  <Form.Group className="mb-3">
                    <Form.Label>Text Color</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="color"
                        value={selectedTitle.style.textColor}
                        onChange={(e) => setSelectedTitle({
                          ...selectedTitle, 
                          style: {...selectedTitle.style, textColor: e.target.value}
                        })}
                        style={{ width: '60px' }}
                      />
                      <Form.Control
                        type="text"
                        value={selectedTitle.style.textColor}
                        onChange={(e) => setSelectedTitle({
                          ...selectedTitle, 
                          style: {...selectedTitle.style, textColor: e.target.value}
                        })}
                      />
                    </div>
                  </Form.Group>
                )}

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Font Size</Form.Label>
                      <Form.Select
                        value={selectedTitle.style.fontSize}
                        onChange={(e) => setSelectedTitle({
                          ...selectedTitle, 
                          style: {...selectedTitle.style, fontSize: e.target.value}
                        })}
                      >
                        {fontSizeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Font Weight</Form.Label>
                      <Form.Select
                        value={selectedTitle.style.fontWeight}
                        onChange={(e) => setSelectedTitle({
                          ...selectedTitle, 
                          style: {...selectedTitle.style, fontWeight: e.target.value}
                        })}
                      >
                        {fontWeightOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <hr />
                <h6>Accent & Effects</h6>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    label="Enable Accent Line"
                    checked={selectedTitle.style.accentEnabled}
                    onChange={(e) => setSelectedTitle({
                      ...selectedTitle, 
                      style: {...selectedTitle.style, accentEnabled: e.target.checked}
                    })}
                  />
                </Form.Group>
                {selectedTitle.style.accentEnabled && (
                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Accent Color</Form.Label>
                        <Form.Control
                          type="color"
                          value={selectedTitle.style.accentColor}
                          onChange={(e) => setSelectedTitle({
                            ...selectedTitle, 
                            style: {...selectedTitle.style, accentColor: e.target.value}
                          })}
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Position</Form.Label>
                        <Form.Select
                          value={selectedTitle.style.accentPosition}
                          onChange={(e) => setSelectedTitle({
                            ...selectedTitle, 
                            style: {...selectedTitle.style, accentPosition: e.target.value}
                          })}
                        >
                          <option value="bottom">Bottom</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Hover Effect</Form.Label>
                  <Form.Select
                    value={selectedTitle.style.hoverEffect}
                    onChange={(e) => setSelectedTitle({
                      ...selectedTitle, 
                      style: {...selectedTitle.style, hoverEffect: e.target.value}
                    })}
                  >
                    {hoverEffects.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <hr />
                <h6>Live Preview</h6>
                <div className="bg-dark rounded p-3">
                  <TitlePreview title={selectedTitle} />
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTitleModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveTitle} disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default SectionSettingsPage
