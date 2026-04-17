import React, { useEffect, useMemo, useRef, useState } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, limit, deleteDoc } from 'firebase/firestore';
import {
  Check,
  X,
  MapPin,
  Search,
  Shield,
  Activity,
  Cpu,
  Navigation,
  MessageSquare,
  Image as ImageIcon,
  FlaskConical,
  Sparkles,
  ScanSearch,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { processReport } from '../services/dataSyncService';
import { verifyImageAuthenticity } from '../services/aiValidationService';
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const formatTimestamp = (value) => {
  if (!value) return 'N/A';

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
};

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('reported');
  const [validatingId, setValidatingId] = useState(null);
  const validationQueueRef = useRef(new Set());

  useEffect(() => {
    const qReports = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribeReports = onSnapshot(qReports, (snapshot) => {
      const data = snapshot.docs.map((item) => processReport({ id: item.id, ...item.data() }));
      setReports(data);
    });

    const qSuggestions = query(collection(db, 'suggestions'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribeSuggestions = onSnapshot(qSuggestions, (snapshot) => {
      const data = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setSuggestions(data);
    });

    return () => {
      unsubscribeReports();
      unsubscribeSuggestions();
    };
  }, []);

  useEffect(() => {
    if (!reports.length) {
      setSelectedId(null);
      return;
    }

    const hasSelectedReport = reports.some((report) => report.id === selectedId);
    if (!selectedId || !hasSelectedReport) {
      setSelectedId(reports[0].id);
    }
  }, [reports, selectedId]);

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedId) || null,
    [reports, selectedId]
  );

  const filteredReports = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    return reports.filter((report) => {
      const normalizedStatus = report.status?.toLowerCase();
      const matchesFilter = filter === 'all' ? true : normalizedStatus === filter;
      const matchesSearch =
        !searchValue ||
        report.type?.toLowerCase().includes(searchValue) ||
        report.displayAddress?.toLowerCase().includes(searchValue) ||
        report.description?.toLowerCase().includes(searchValue);

      return matchesFilter && matchesSearch;
    });
  }, [filter, reports, searchTerm]);

  const runAutoValidation = async (report) => {
    const hasFinalVerification = report?.aiVerification && report.aiVerification.status !== 'ERROR';

    if (!report?.id || !report.imageUrl || hasFinalVerification || validationQueueRef.current.has(report.id)) {
      return;
    }

    validationQueueRef.current.add(report.id);
    setValidatingId(report.id);

    try {
      const result = await verifyImageAuthenticity(report.imageUrl, report.type);

      await updateDoc(doc(db, 'reports', report.id), {
        aiVerification: {
          ...result,
          analyzedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('AI Validation Error:', error);
    } finally {
      validationQueueRef.current.delete(report.id);
      setValidatingId((current) => (current === report.id ? null : current));
    }
  };

  useEffect(() => {
    const hasFinalVerification = selectedReport?.aiVerification && selectedReport.aiVerification.status !== 'ERROR';

    if (!selectedReport?.imageUrl || hasFinalVerification) {
      return;
    }

    runAutoValidation(selectedReport);
  }, [selectedReport]);

  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(db, 'reports', id), { status: 'approved' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id) => {
    try {
      await updateDoc(doc(db, 'reports', id), { status: 'rejected' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (report) => {
    if (!report?.id) {
      return;
    }

    const shouldDelete = window.confirm(`Delete report "${report.type || 'Untitled report'}"? This action cannot be undone.`);
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'reports', report.id));

      const remainingReports = reports.filter((item) => item.id !== report.id);
      setSelectedId(remainingReports[0]?.id || null);
    } catch (error) {
      console.error(error);
      window.alert('Unable to delete this report right now.');
    }
  };

  const isValidatingSelected = validatingId === selectedReport?.id;
  const verificationStatus = selectedReport?.aiVerification?.status;
  const verificationTone =
    verificationStatus === 'TRUE'
      ? positiveTone
      : verificationStatus === 'FAKE'
        ? dangerTone
        : neutralTone;
  const verificationSummaryLabel =
    verificationStatus === 'TRUE'
      ? 'AI result: TRUE'
      : verificationStatus === 'FAKE'
        ? 'AI result: FAKE'
        : verificationStatus === 'ERROR'
          ? 'Validation unavailable'
          : 'Queued for AI review';
  const verificationBadgeLabel =
    verificationStatus === 'TRUE'
      ? 'Verified'
      : verificationStatus === 'FAKE'
        ? 'Review needed'
        : verificationStatus === 'ERROR'
          ? 'Service unavailable'
          : 'Waiting';
  const verificationIntegrityLabel =
    verificationStatus === 'TRUE'
      ? 'Valid evidence'
      : verificationStatus === 'FAKE'
        ? 'Review needed'
        : verificationStatus === 'ERROR'
          ? 'Service unavailable'
          : 'Pending';
  const verificationScoreLabel =
    verificationStatus === 'ERROR'
      ? 'N/A'
      : selectedReport?.aiVerification
        ? `${selectedReport.aiVerification.score}%`
        : isValidatingSelected
          ? 'Scanning'
          : 'Pending';

  return (
    <div style={containerStyle}>
      <aside style={masterPaneStyle}>
        <div style={paneHeaderStyle}>
          <div style={sectionHeaderStyle}>
            <Activity size={18} color="#0f766e" />
            <span style={terminalLabelStyle}>Incident Queue</span>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={16} style={searchIconStyle} />
            <input
              style={searchInputStyle}
              placeholder="Search reports, areas, or issue details"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div style={filterScrollStyle}>
            <FilterChip active={filter === 'reported'} onClick={() => setFilter('reported')} label="Pending" />
            <FilterChip active={filter === 'approved'} onClick={() => setFilter('approved')} label="Approved" />
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="All history" />
          </div>
        </div>

        <div style={listScrollStyle}>
          {filteredReports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedId(report.id)}
              style={reportItemStyle(selectedId === report.id)}
            >
              <div style={reportTopRowStyle}>
                {report.imageUrl ? (
                  <img src={report.imageUrl} alt={report.type} style={reportThumbStyle} />
                ) : (
                  <div style={emptyThumbStyle}>
                    <ImageIcon size={18} />
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={reportHeadlineRowStyle}>
                    <span style={reportTypeStyle}>{report.type || 'Uncategorized report'}</span>
                    <span style={reportIdStyle}>#{report.id.substring(0, 6)}</span>
                  </div>
                  <div style={reportMetaStyle}>
                    <MapPin size={12} />
                    <span>{report.displayAddress}</span>
                  </div>
                </div>
              </div>

              <div style={reportFooterStyle}>
                <span style={scorePill(report.score)}>{report.score} risk</span>
                <span style={statusPill(report.status)}>{report.status}</span>
              </div>
            </button>
          ))}

          {!filteredReports.length && (
            <div style={emptyListStyle}>
              <Search size={20} color="#94a3b8" />
              <p>No reports match this filter.</p>
            </div>
          )}
        </div>
      </aside>

      <section style={detailPaneStyle}>
        <AnimatePresence mode="wait">
          {selectedReport ? (
            <motion.div
              key={selectedReport.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div style={detailHeaderStyle}>
                <div>
                  <div style={liveRowStyle}>
                    <div style={livePulse} />
                    <span style={liveLabelStyle}>Live inspection</span>
                  </div>
                  <h1 style={detailTitleStyle}>{selectedReport.type || 'Incident report'}</h1>
                  <p style={detailSubtitleStyle}>{selectedReport.displayAddress}</p>
                </div>

                <div style={actionGroupStyle}>
                  {selectedReport.status === 'reported' ? (
                    <>
                      <button onClick={() => handleApprove(selectedReport.id)} style={approveBtnStyle}>
                        <Check size={18} /> Approve report
                      </button>
                      <button onClick={() => handleReject(selectedReport.id)} style={rejectBtnStyle}>
                        <X size={18} /> Reject report
                      </button>
                    </>
                  ) : (
                    <div style={finalStatusPill(selectedReport.status)}>{selectedReport.status}</div>
                  )}
                  <button onClick={() => handleDelete(selectedReport)} style={deleteBtnStyle}>
                    <Trash2 size={18} /> Delete report
                  </button>
                </div>
              </div>

              {suggestions.length > 0 && (
                <div style={suggestionHighlightBoxStyle}>
                  <div style={sectionHeaderStyle}>
                    <MessageSquare size={16} color="#2563eb" />
                    <span style={{ ...terminalLabelStyle, color: '#2563eb' }}>Public improvement feed</span>
                  </div>
                  <div style={suggestionTextStyle}>
                    "{suggestions[0].text}" <span style={suggestionAuthorStyle}>by {suggestions[0].userEmail || 'Anonymous'}</span>
                  </div>
                </div>
              )}

              <div style={detailContentScroll}>
                <div style={heroGridStyle}>
                  <div style={heroImageCardStyle}>
                    {selectedReport.imageUrl ? (
                      <img src={selectedReport.imageUrl} alt="Uploaded report evidence" style={heroImageStyle} />
                    ) : (
                      <div style={imageFallbackStyle}>
                        <ImageIcon size={34} />
                        <p>No image uploaded for this report.</p>
                      </div>
                    )}
                    <div style={heroBadgeStyle}>Citizen upload</div>
                  </div>

                  <div style={heroSummaryCardStyle}>
                    <div style={summaryBadgeStyle(verificationTone)}>
                      <Sparkles size={14} />
                      {selectedReport.imageUrl
                        ? isValidatingSelected
                          ? 'AI review in progress'
                          : verificationSummaryLabel
                        : 'No image available'}
                    </div>
                    <div style={summaryMetricsGrid}>
                      <StatCard label="Priority score" value={selectedReport.score} tone={selectedReport.score > 70 ? dangerTone : positiveTone} />
                      <StatCard
                        label="Confidence"
                        value={verificationScoreLabel}
                        tone={verificationTone}
                      />
                      <StatCard label="Estimated time" value={selectedReport.aiData?.timeToRepair || 'N/A'} tone={neutralTone} />
                      <StatCard label="Resource level" value={selectedReport.aiData?.riskLevel || 'Standard'} tone={neutralTone} />
                    </div>
                  </div>
                </div>

                <div style={detailGrid}>
                  <div style={leftColumnStyle}>
                    <div style={cardStyle}>
                      <div style={cardHeaderRowStyle}>
                        <h3 style={cardTitleStyle}>
                          <FlaskConical size={16} />
                          Image verification
                        </h3>
                        <span style={summaryBadgeStyle(verificationTone)}>
                          {selectedReport.imageUrl
                            ? isValidatingSelected
                              ? 'Scanning evidence'
                              : verificationBadgeLabel
                            : 'Unavailable'}
                        </span>
                      </div>

                      {selectedReport.imageUrl ? (
                        <div style={{ display: 'grid', gap: '18px' }}>
                          <img src={selectedReport.imageUrl} alt="Uploaded evidence preview" style={verificationImageStyle} />

                          {selectedReport.aiVerification ? (
                            <>
                              <div style={diagnosticGrid}>
                                <DiagItem label="Veracity score" value={verificationScoreLabel} color={verificationTone.text} />
                                <DiagItem
                                  label="Integrity check"
                                  value={verificationIntegrityLabel}
                                  color={verificationTone.text}
                                />
                              </div>

                              <div>
                                <span style={subtleLabelStyle}>AI notes</span>
                                <p style={descText}>{selectedReport.aiVerification.breakdown || 'No explanation returned by the model.'}</p>
                              </div>

                              <div>
                                <span style={subtleLabelStyle}>Detected anomalies</span>
                                <div style={pillWrapStyle}>
                                  {(selectedReport.aiVerification.anomalies?.length
                                    ? selectedReport.aiVerification.anomalies
                                    : ['No major anomalies detected']
                                  ).map((item, index) => (
                                    <span key={`${item}-${index}`} style={anomalyPillStyle(item === 'No major anomalies detected')}>
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div style={pendingPanelStyle}>
                              <ScanSearch size={18} color="#0f766e" />
                              <div>
                                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>Automatic validation is running</strong>
                                <span style={{ color: '#64748b', fontSize: '13px' }}>
                                  The uploaded image is being checked in the background as soon as the report is opened.
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={noAiStateStyle}>
                          <ImageIcon size={32} color="#94a3b8" />
                          <p>This report does not include an uploaded image.</p>
                        </div>
                      )}
                    </div>

                    <div style={cardStyle}>
                      <h3 style={cardTitleStyle}>
                        <Cpu size={16} />
                        Report analysis
                      </h3>
                      <div style={diagnosticGrid}>
                        <DiagItem label="Priority score" value={selectedReport.score} color={selectedReport.score > 70 ? '#dc2626' : '#0f766e'} />
                        <DiagItem label="Confidence level" value={verificationScoreLabel} />
                        <DiagItem label="Est. completion" value={selectedReport.aiData?.timeToRepair || 'N/A'} />
                        <DiagItem label="Resource req." value={selectedReport.aiData?.riskLevel || 'Standard'} />
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <h3 style={cardTitleStyle}>
                        <Shield size={16} />
                        Citizen metadata
                      </h3>
                      <div style={metaStackStyle}>
                        <MetaRow label="User ID" value={selectedReport.userId ? `${selectedReport.userId.substring(0, 12)}...` : 'Unknown'} />
                        <MetaRow label="Timestamp" value={formatTimestamp(selectedReport.createdAt)} />
                        <MetaRow label="Description" value={selectedReport.description || 'No additional context provided by the citizen.'} multiline />
                      </div>
                    </div>
                  </div>

                  <div style={mapCardStyle}>
                    <MapContainer
                      center={[selectedReport.location?.lat || 19.076, selectedReport.location?.lng || 72.8777]}
                      zoom={15}
                      style={{ height: '100%', width: '100%', borderRadius: '22px' }}
                      zoomControl={false}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[selectedReport.location?.lat || 19.076, selectedReport.location?.lng || 72.8777]}
                        icon={defaultIcon}
                      />
                      <ZoomControl position="bottomright" />
                    </MapContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div style={noSelectionStyle}>
              <Navigation size={48} color="#94a3b8" />
              <p style={{ color: '#64748b', fontWeight: 600, marginTop: '16px' }}>Select a report to review its details.</p>
            </div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

const FilterChip = ({ active, onClick, label }) => (
  <button onClick={onClick} style={filterChipStyle(active)}>
    {label}
  </button>
);

const DiagItem = ({ label, value, color = '#0f172a' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <span style={subtleLabelStyle}>{label}</span>
    <span style={{ fontSize: '20px', fontWeight: 800, color }}>{value}</span>
  </div>
);

const StatCard = ({ label, value, tone }) => (
  <div style={statCardStyle}>
    <span style={subtleLabelStyle}>{label}</span>
    <strong style={{ fontSize: '22px', color: tone.text }}>{value}</strong>
  </div>
);

const MetaRow = ({ label, value, multiline = false }) => (
  <div style={{ ...metaDataRow, alignItems: multiline ? 'flex-start' : 'center' }}>
    <span style={metaLabelStyle}>{label}</span>
    {multiline ? <p style={descText}>{value}</p> : <strong style={metaValueStyle}>{value}</strong>}
  </div>
);

const positiveTone = {
  bg: '#ecfdf5',
  border: '#bbf7d0',
  text: '#047857'
};

const dangerTone = {
  bg: '#fef2f2',
  border: '#fecaca',
  text: '#b91c1c'
};

const neutralTone = {
  bg: '#eff6ff',
  border: '#bfdbfe',
  text: '#1d4ed8'
};

const containerStyle = {
  display: 'flex',
  height: 'calc(100vh - 80px)',
  background: 'linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)'
};

const masterPaneStyle = {
  width: '360px',
  borderRight: '1px solid #dbe4f0',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255, 255, 255, 0.86)',
  backdropFilter: 'blur(18px)'
};

const paneHeaderStyle = {
  padding: '24px',
  borderBottom: '1px solid #e2e8f0'
};

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '16px'
};

const terminalLabelStyle = {
  fontSize: '11px',
  fontWeight: 800,
  color: '#475569',
  letterSpacing: '0.12em',
  textTransform: 'uppercase'
};

const searchInputStyle = {
  width: '100%',
  padding: '12px 14px 12px 40px',
  background: '#ffffff',
  border: '1px solid #dbe4f0',
  borderRadius: '14px',
  color: '#0f172a',
  fontSize: '14px',
  outline: 'none',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)'
};

const searchIconStyle = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8'
};

const filterScrollStyle = {
  display: 'flex',
  gap: '8px',
  marginTop: '16px',
  overflowX: 'auto',
  paddingBottom: '4px'
};

const filterChipStyle = (active) => ({
  padding: '8px 14px',
  background: active ? '#0f766e' : '#f8fafc',
  color: active ? '#ffffff' : '#64748b',
  border: active ? '1px solid #0f766e' : '1px solid #dbe4f0',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 700,
  cursor: 'pointer'
});

const listScrollStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '14px'
};

const reportItemStyle = (active) => ({
  width: '100%',
  padding: '16px',
  borderRadius: '18px',
  marginBottom: '10px',
  cursor: 'pointer',
  background: active ? 'linear-gradient(135deg, #ffffff 0%, #eef7ff 100%)' : '#ffffff',
  border: active ? '1px solid #93c5fd' : '1px solid #e2e8f0',
  boxShadow: active ? '0 18px 36px rgba(37, 99, 235, 0.12)' : '0 10px 24px rgba(15, 23, 42, 0.05)',
  textAlign: 'left'
});

const reportTopRowStyle = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center'
};

const reportThumbStyle = {
  width: '54px',
  height: '54px',
  borderRadius: '14px',
  objectFit: 'cover',
  flexShrink: 0
};

const emptyThumbStyle = {
  width: '54px',
  height: '54px',
  borderRadius: '14px',
  background: '#f1f5f9',
  color: '#94a3b8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const reportHeadlineRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '10px',
  marginBottom: '6px'
};

const reportTypeStyle = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#0f172a'
};

const reportIdStyle = {
  fontSize: '11px',
  fontFamily: 'monospace',
  color: '#64748b'
};

const reportMetaStyle = {
  fontSize: '12px',
  color: '#64748b',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const reportFooterStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '14px'
};

const scorePill = (score) => ({
  fontSize: '11px',
  fontWeight: 700,
  padding: '6px 10px',
  borderRadius: '999px',
  background: score > 70 ? '#fef2f2' : '#ecfdf5',
  color: score > 70 ? '#dc2626' : '#047857'
});

const statusPill = (status) => ({
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'capitalize',
  padding: '6px 10px',
  borderRadius: '999px',
  background: status === 'approved' ? '#eff6ff' : status === 'rejected' ? '#fff1f2' : '#fff7ed',
  color: status === 'approved' ? '#1d4ed8' : status === 'rejected' ? '#be123c' : '#c2410c'
});

const emptyListStyle = {
  minHeight: '180px',
  border: '1px dashed #cbd5e1',
  borderRadius: '18px',
  color: '#64748b',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  background: 'rgba(255,255,255,0.7)'
};

const detailPaneStyle = {
  flex: 1,
  padding: '32px 36px',
  position: 'relative'
};

const detailHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '16px',
  paddingBottom: '24px'
};

const liveRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '10px'
};

const livePulse = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: '#10b981',
  boxShadow: '0 0 0 6px rgba(16, 185, 129, 0.12)'
};

const liveLabelStyle = {
  fontSize: '11px',
  fontWeight: 800,
  color: '#0f766e',
  letterSpacing: '0.12em',
  textTransform: 'uppercase'
};

const detailTitleStyle = {
  fontSize: '34px',
  fontWeight: 800,
  color: '#0f172a',
  margin: 0
};

const detailSubtitleStyle = {
  marginTop: '6px',
  color: '#64748b',
  fontSize: '15px'
};

const actionGroupStyle = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap'
};

const approveBtnStyle = {
  padding: '12px 20px',
  background: '#0f766e',
  color: '#ffffff',
  borderRadius: '14px',
  fontSize: '14px',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  boxShadow: '0 12px 24px rgba(15, 118, 110, 0.2)'
};

const rejectBtnStyle = {
  padding: '12px 20px',
  background: '#ffffff',
  color: '#dc2626',
  border: '1px solid #fecaca',
  borderRadius: '14px',
  fontSize: '14px',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const deleteBtnStyle = {
  padding: '12px 20px',
  background: '#fff1f2',
  color: '#be123c',
  border: '1px solid #fecdd3',
  borderRadius: '14px',
  fontSize: '14px',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const finalStatusPill = (status) => ({
  padding: '12px 18px',
  background: '#f8fafc',
  color: '#475569',
  borderRadius: '999px',
  fontSize: '13px',
  fontWeight: 700,
  textTransform: 'capitalize',
  border: '1px solid #dbe4f0'
});

const suggestionHighlightBoxStyle = {
  padding: '18px 20px',
  background: '#ffffff',
  border: '1px solid #dbeafe',
  borderRadius: '18px',
  marginBottom: '24px',
  boxShadow: '0 12px 28px rgba(37, 99, 235, 0.08)'
};

const suggestionTextStyle = {
  fontSize: '14px',
  color: '#0f172a',
  fontWeight: 600
};

const suggestionAuthorStyle = {
  color: '#64748b',
  fontWeight: 500
};

const detailContentScroll = {
  flex: 1,
  overflowY: 'auto',
  paddingRight: '4px'
};

const heroGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr',
  gap: '24px',
  marginBottom: '24px'
};

const heroImageCardStyle = {
  position: 'relative',
  minHeight: '280px',
  borderRadius: '28px',
  overflow: 'hidden',
  background: '#ffffff',
  border: '1px solid #dbe4f0',
  boxShadow: '0 24px 48px rgba(15, 23, 42, 0.08)'
};

const heroImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const imageFallbackStyle = {
  width: '100%',
  height: '100%',
  minHeight: '280px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  color: '#94a3b8',
  background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)'
};

const heroBadgeStyle = {
  position: 'absolute',
  top: '16px',
  left: '16px',
  background: 'rgba(255, 255, 255, 0.9)',
  padding: '8px 12px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 700,
  color: '#0f172a',
  border: '1px solid rgba(255,255,255,0.8)'
};

const heroSummaryCardStyle = {
  background: '#ffffff',
  borderRadius: '28px',
  border: '1px solid #dbe4f0',
  boxShadow: '0 24px 48px rgba(15, 23, 42, 0.08)',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  justifyContent: 'space-between'
};

const summaryBadgeStyle = (tone) => ({
  width: 'fit-content',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: '999px',
  background: tone.bg,
  color: tone.text,
  border: `1px solid ${tone.border}`,
  fontSize: '12px',
  fontWeight: 700
});

const summaryMetricsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '14px'
};

const statCardStyle = {
  background: '#f8fbff',
  border: '1px solid #e2e8f0',
  borderRadius: '18px',
  padding: '16px',
  display: 'grid',
  gap: '8px'
};

const detailGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1.05fr',
  gap: '24px'
};

const leftColumnStyle = {
  display: 'grid',
  gap: '24px'
};

const cardStyle = {
  padding: '24px',
  borderRadius: '24px',
  background: '#ffffff',
  border: '1px solid #dbe4f0',
  boxShadow: '0 16px 32px rgba(15, 23, 42, 0.06)'
};

const cardHeaderRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '18px',
  flexWrap: 'wrap'
};

const cardTitleStyle = {
  fontSize: '14px',
  fontWeight: 800,
  color: '#334155',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  margin: 0
};

const subtleLabelStyle = {
  fontSize: '11px',
  color: '#64748b',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em'
};

const verificationImageStyle = {
  width: '100%',
  maxHeight: '280px',
  objectFit: 'cover',
  borderRadius: '18px',
  border: '1px solid #e2e8f0'
};

const diagnosticGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '18px'
};

const descText = {
  background: '#f8fbff',
  padding: '14px',
  borderRadius: '14px',
  fontSize: '13px',
  color: '#475569',
  lineHeight: 1.6,
  marginTop: '8px',
  border: '1px solid #e2e8f0'
};

const pillWrapStyle = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  marginTop: '10px'
};

const anomalyPillStyle = (isNeutral) => ({
  padding: '6px 10px',
  background: isNeutral ? '#eff6ff' : '#fff7ed',
  color: isNeutral ? '#1d4ed8' : '#c2410c',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 700,
  border: `1px solid ${isNeutral ? '#bfdbfe' : '#fed7aa'}`
});

const pendingPanelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 16px',
  background: '#f0fdfa',
  border: '1px solid #99f6e4',
  borderRadius: '16px'
};

const noAiStateStyle = {
  padding: '36px 20px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  color: '#64748b',
  fontSize: '13px',
  fontWeight: 600,
  background: '#f8fafc',
  borderRadius: '18px',
  border: '1px dashed #cbd5e1'
};

const metaStackStyle = {
  display: 'grid',
  gap: '14px'
};

const metaDataRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px'
};

const metaLabelStyle = {
  color: '#64748b',
  fontWeight: 700,
  minWidth: '110px'
};

const metaValueStyle = {
  color: '#0f172a',
  fontWeight: 700
};

const mapCardStyle = {
  minHeight: '560px',
  padding: '10px',
  borderRadius: '28px',
  overflow: 'hidden',
  background: '#ffffff',
  border: '1px solid #dbe4f0',
  boxShadow: '0 16px 32px rgba(15, 23, 42, 0.06)'
};

const noSelectionStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center'
};

export default AdminDashboard;
