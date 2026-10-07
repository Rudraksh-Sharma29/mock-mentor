import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import ScoreCard from '../components/ScoreCard';
import Loading from '../components/Loading';

import {
  Shield,
  Users,
  FileQuestion,
  BarChart3,
  Layers,
  Database,
  Search,
  Trash2
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  const [usersList, setUsersList] = useState([]);
  const [interviewsList, setInterviewsList] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchFilter, setSearchFilter] = useState('');
  const [deletingUserId, setDeletingUserId] = useState(null);

  // --------------------------------------------------
  // FETCH ADMIN DATA
  // --------------------------------------------------

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        const [
          statsRes,
          usersRes,
          interviewsRes,
          questionsRes
        ] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getUsers(),
          adminAPI.getInterviews(),
          adminAPI.getQuestions()
        ]);

        setStats(statsRes.data);
        setUsersList(usersRes.data || []);
        setInterviewsList(interviewsRes.data || []);
        setQuestionsList(questionsRes.data || []);

      } catch (err) {
        setError(
          err.response?.data?.detail ||
          err.message ||
          'Failed to fetch administrator data.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // --------------------------------------------------
  // DELETE USER
  // --------------------------------------------------

  const handleDeleteUser = async (user) => {

    // Don't allow admin deletion
    if (user.role === 'admin') {
      alert('Admin accounts cannot be deleted.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name || user.email}?\n\n` +
      `This will also delete all interview attempts of this user.`
    );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingUserId(user.id);
      setError('');

      // Call backend
      await adminAPI.deleteUser(user.id);

      // Remove user from frontend
      setUsersList((prevUsers) =>
        prevUsers.filter((u) => u.id !== user.id)
      );

      // Remove user's interviews from frontend
      setInterviewsList((prevInterviews) =>
        prevInterviews.filter(
          (interview) => interview.user_id !== user.id
        )
      );

      // Refresh statistics
      const statsRes = await adminAPI.getDashboardStats();
      setStats(statsRes.data);

      alert('User deleted successfully.');

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to delete user.'
      );

    } finally {

      setDeletingUserId(null);

    }
  };

  // --------------------------------------------------
  // GET USER INTERVIEWS
  // --------------------------------------------------

  const getUserInterviews = (userId) => {
    return interviewsList.filter(
      (interview) => interview.user_id === userId
    );
  };

  // --------------------------------------------------
  // DIFFICULTY BADGE
  // --------------------------------------------------

  const getDifficultyBadge = (diff) => {

    switch (diff?.toLowerCase()) {

      case 'easy':
        return (
          <span className="badge badge-emerald">
            Easy
          </span>
        );

      case 'hard':
        return (
          <span className="badge badge-rose">
            Hard
          </span>
        );

      case 'medium':
      default:
        return (
          <span className="badge badge-amber">
            Medium
          </span>
        );
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return <Loading text="Loading administrator metrics..." />;
  }

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-content">

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >

          <div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}
            >

              <span className="badge badge-cyan">
                <Shield size={12} />
                Administrator Portal
              </span>

            </div>

            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 800
              }}
            >
              Platform{' '}
              <span className="text-gradient">
                Control Center
              </span>
            </h1>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.95rem'
              }}
            >
              Monitor users, interview attempts and question bank.
            </p>

          </div>

        </div>


        {/* ========================================= */}
        {/* ERROR */}
        {/* ========================================= */}

        {error && (
          <div
            style={{
              padding: '16px',
              marginBottom: '24px',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.1)',
              color: '#fb7185'
            }}
          >
            {error}
          </div>
        )}


        {/* ========================================= */}
        {/* STAT CARDS */}
        {/* ========================================= */}

        <div
          className="grid-4"
          style={{
            marginBottom: '32px'
          }}
        >

          <ScoreCard
            title="Total Users"
            score={stats?.total_users || 0}
            max={Math.max(
              10,
              stats?.total_users || 0
            )}
            icon={Users}
            color="cyan"
            subtitle="Registered candidate accounts"
          />

          <ScoreCard
            title="Total Interviews"
            score={stats?.total_interviews || 0}
            max={Math.max(
              10,
              stats?.total_interviews || 0
            )}
            icon={Layers}
            color="purple"
            subtitle={`${stats?.completed_interviews || 0} completed`}
          />

          <ScoreCard
            title="Question Bank"
            score={stats?.total_questions || 0}
            max={100}
            icon={Database}
            color="emerald"
            subtitle="Active questions"
          />

          <ScoreCard
            title="Avg Platform Score"
            score={stats?.average_interview_score || 0}
            max={100}
            icon={BarChart3}
            color="amber"
            subtitle="Across completed sessions"
          />

        </div>


        {/* ========================================= */}
        {/* TABS */}
        {/* ========================================= */}

        <div
          style={{
            display: 'flex',
            gap: '12px',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}
        >

          {/* USERS */}

          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom:
                activeTab === 'users'
                  ? '2px solid #06b6d4'
                  : '2px solid transparent',
              color:
                activeTab === 'users'
                  ? '#ffffff'
                  : 'var(--text-muted)',
              fontWeight:
                activeTab === 'users'
                  ? 700
                  : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >

            <Users size={16} />

            Users ({usersList.length})

          </button>


          {/* INTERVIEWS */}

          <button
            onClick={() => setActiveTab('interviews')}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom:
                activeTab === 'interviews'
                  ? '2px solid #8b5cf6'
                  : '2px solid transparent',
              color:
                activeTab === 'interviews'
                  ? '#ffffff'
                  : 'var(--text-muted)',
              fontWeight:
                activeTab === 'interviews'
                  ? 700
                  : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >

            <Layers size={16} />

            Interviews ({interviewsList.length})

          </button>


          {/* QUESTIONS */}

          <button
            onClick={() => setActiveTab('questions')}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom:
                activeTab === 'questions'
                  ? '2px solid #10b981'
                  : '2px solid transparent',
              color:
                activeTab === 'questions'
                  ? '#ffffff'
                  : 'var(--text-muted)',
              fontWeight:
                activeTab === 'questions'
                  ? 700
                  : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >

            <Database size={16} />

            Questions ({questionsList.length})

          </button>

        </div>


        {/* ========================================= */}
        {/* MAIN CARD */}
        {/* ========================================= */}

        <div
          className="glass-card"
          style={{
            padding: '24px'
          }}
        >


          {/* ======================================= */}
          {/* USERS TAB */}
          {/* ======================================= */}

          {activeTab === 'users' && (

            <div>

              {/* SEARCH */}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px',
                  padding: '10px 14px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  maxWidth: '450px'
                }}
              >

                <Search
                  size={17}
                  style={{
                    color: 'var(--text-dim)'
                  }}
                />

                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) =>
                    setSearchFilter(e.target.value)
                  }
                  placeholder="Search name, email or ID..."
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: '#ffffff'
                  }}
                />

              </div>


              {/* USERS TABLE */}

              <div
                style={{
                  overflowX: 'auto'
                }}
              >

                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '0.9rem'
                  }}
                >

                  <thead>

                    <tr
                      style={{
                        borderBottom:
                          '1px solid var(--border-color)',
                        color: 'var(--text-dim)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase'
                      }}
                    >

                      <th style={{ padding: '12px 16px' }}>
                        User ID
                      </th>

                      <th style={{ padding: '12px 16px' }}>
                        Name
                      </th>

                      <th style={{ padding: '12px 16px' }}>
                        Email
                      </th>

                      <th style={{ padding: '12px 16px' }}>
                        Role
                      </th>

                      <th style={{ padding: '12px 16px' }}>
                        Joined
                      </th>

                      <th style={{ padding: '12px 16px' }}>
                        Attempts
                      </th>

                      <th style={{ padding: '12px 16px' }}>
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {usersList
                      .filter((user) => {

                        const query =
                          searchFilter
                            .trim()
                            .toLowerCase();

                        if (!query) {
                          return true;
                        }

                        return (
                          String(user.id)
                            .includes(query) ||

                          (user.name || '')
                            .toLowerCase()
                            .includes(query) ||

                          (user.email || '')
                            .toLowerCase()
                            .includes(query)
                        );

                      })
                      .map((user) => {

                        const userInterviews =
                          getUserInterviews(user.id);

                        return (
                          <React.Fragment key={user.id}>

                            {/* USER ROW */}

                            <tr
                              style={{
                                borderBottom:
                                  '1px solid rgba(255,255,255,0.04)'
                              }}
                            >

                              <td
                                style={{
                                  padding: '14px 16px',
                                  color: 'var(--text-dim)',
                                  fontFamily: 'var(--font-mono)'
                                }}
                              >
                                #{user.id}
                              </td>


                              <td
                                style={{
                                  padding: '14px 16px',
                                  fontWeight: 600,
                                  color: '#ffffff'
                                }}
                              >
                                {user.name}
                              </td>


                              <td
                                style={{
                                  padding: '14px 16px',
                                  color: 'var(--text-muted)'
                                }}
                              >
                                {user.email}
                              </td>


                              <td
                                style={{
                                  padding: '14px 16px'
                                }}
                              >

                                {user.role === 'admin' ? (

                                  <span className="badge badge-cyan">
                                    Admin
                                  </span>

                                ) : (

                                  <span className="badge badge-purple">
                                    Candidate
                                  </span>

                                )}

                              </td>


                              <td
                                style={{
                                  padding: '14px 16px',
                                  color: 'var(--text-dim)'
                                }}
                              >

                                {user.created_at
                                  ? new Date(
                                      user.created_at
                                    ).toLocaleDateString()
                                  : '—'}

                              </td>


                              <td
                                style={{
                                  padding: '14px 16px'
                                }}
                              >

                                <span className="badge badge-amber">

                                  {userInterviews.length}

                                  {' '}

                                  {userInterviews.length === 1
                                    ? 'Attempt'
                                    : 'Attempts'}

                                </span>

                              </td>


                              <td
                                style={{
                                  padding: '14px 16px'
                                }}
                              >

                                {user.role !== 'admin' && (

                                  <button
                                    onClick={() =>
                                      handleDeleteUser(user)
                                    }
                                    disabled={
                                      deletingUserId ===
                                      user.id
                                    }
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding:
                                        '8px 12px',
                                      border:
                                        '1px solid rgba(244,63,94,0.35)',
                                      borderRadius:
                                        '8px',
                                      background:
                                        'rgba(244,63,94,0.1)',
                                      color: '#fb7185',
                                      cursor:
                                        deletingUserId ===
                                        user.id
                                          ? 'not-allowed'
                                          : 'pointer',
                                      opacity:
                                        deletingUserId ===
                                        user.id
                                          ? 0.6
                                          : 1
                                    }}
                                  >

                                    <Trash2 size={14} />

                                    {deletingUserId ===
                                    user.id
                                      ? 'Deleting...'
                                      : 'Delete'}

                                  </button>

                                )}

                              </td>

                            </tr>


                            {/* ================================= */}
                            {/* USER INTERVIEW ATTEMPTS */}
                            {/* ================================= */}

                            {userInterviews.length > 0 && (

                              <tr>

                                <td
                                  colSpan="7"
                                  style={{
                                    padding:
                                      '12px 24px 20px',
                                    background:
                                      'rgba(255,255,255,0.015)'
                                  }}
                                >

                                  <div
                                    style={{
                                      fontSize:
                                        '0.75rem',
                                      color:
                                        'var(--text-dim)',
                                      textTransform:
                                        'uppercase',
                                      fontWeight: 700,
                                      marginBottom:
                                        '10px'
                                    }}
                                  >
                                    Interview Attempts
                                  </div>


                                  <div
                                    style={{
                                      display: 'grid',
                                      gap: '8px'
                                    }}
                                  >

                                    {userInterviews.map(
                                      (attempt) => (

                                        <div
                                          key={
                                            attempt.id
                                          }
                                          style={{
                                            display:
                                              'grid',
                                            gridTemplateColumns:
                                              '70px 1.2fr 1fr 100px 100px 120px',
                                            gap: '12px',
                                            alignItems:
                                              'center',
                                            padding:
                                              '10px 12px',
                                            borderRadius:
                                              '8px',
                                            background:
                                              'rgba(255,255,255,0.025)'
                                          }}
                                        >

                                          <span
                                            style={{
                                              color:
                                                'var(--text-dim)',
                                              fontFamily:
                                                'var(--font-mono)'
                                            }}
                                          >
                                            #{attempt.id}
                                          </span>


                                          <span
                                            style={{
                                              color:
                                                '#ffffff',
                                              fontWeight: 600
                                            }}
                                          >
                                            {attempt.job_role ||
                                              '—'}
                                          </span>


                                          <span className="badge badge-purple">
                                            {attempt.interview_type ||
                                              '—'}
                                          </span>


                                          <span>
                                            {getDifficultyBadge(
                                              attempt.difficulty
                                            )}
                                          </span>


                                          <span
                                            style={{
                                              color:
                                                '#ffffff'
                                            }}
                                          >

                                            {attempt.completed &&
                                            typeof attempt.overall_score ===
                                              'number'
                                              ? `${attempt.overall_score}%`
                                              : 'Pending'}

                                          </span>


                                          <span
                                            style={{
                                              color:
                                                'var(--text-dim)'
                                            }}
                                          >

                                            {attempt.created_at
                                              ? new Date(
                                                  attempt.created_at
                                                ).toLocaleDateString()
                                              : '—'}

                                          </span>

                                        </div>

                                      )
                                    )}

                                  </div>

                                </td>

                              </tr>

                            )}

                          </React.Fragment>
                        );

                      })}

                  </tbody>

                </table>

              </div>

            </div>

          )}


          {/* ========================================= */}
          {/* INTERVIEWS TAB */}
          {/* ========================================= */}

          {activeTab === 'interviews' && (

            <div
              style={{
                overflowX: 'auto'
              }}
            >

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '0.9rem'
                }}
              >

                <thead>

                  <tr
                    style={{
                      borderBottom:
                        '1px solid var(--border-color)',
                      color: 'var(--text-dim)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase'
                    }}
                  >

                    <th style={{ padding: '12px 16px' }}>
                      ID
                    </th>

                    <th style={{ padding: '12px 16px' }}>
                      User ID
                    </th>

                    <th style={{ padding: '12px 16px' }}>
                      Role
                    </th>

                    <th style={{ padding: '12px 16px' }}>
                      Type
                    </th>

                    <th style={{ padding: '12px 16px' }}>
                      Difficulty
                    </th>

                    <th style={{ padding: '12px 16px' }}>
                      Score
                    </th>

                    <th style={{ padding: '12px 16px' }}>
                      Status
                    </th>

                    <th style={{ padding: '12px 16px' }}>
                      Date
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {interviewsList.map((item) => (

                    <tr
                      key={item.id}
                      style={{
                        borderBottom:
                          '1px solid rgba(255,255,255,0.04)'
                      }}
                    >

                      <td
                        style={{
                          padding: '14px 16px',
                          color:
                            'var(--text-dim)',
                          fontFamily:
                            'var(--font-mono)'
                        }}
                      >
                        #{item.id}
                      </td>


                      <td
                        style={{
                          padding: '14px 16px',
                          color:
                            'var(--text-muted)'
                        }}
                      >
                        User #{item.user_id}
                      </td>


                      <td
                        style={{
                          padding: '14px 16px',
                          fontWeight: 600,
                          color: '#ffffff'
                        }}
                      >
                        {item.job_role}
                      </td>


                      <td
                        style={{
                          padding: '14px 16px'
                        }}
                      >
                        <span className="badge badge-purple">
                          {item.interview_type}
                        </span>
                      </td>


                      <td
                        style={{
                          padding: '14px 16px'
                        }}
                      >
                        {getDifficultyBadge(
                          item.difficulty
                        )}
                      </td>


                      <td
                        style={{
                          padding: '14px 16px'
                        }}
                      >

                        {item.completed &&
                        typeof item.overall_score ===
                          'number' ? (

                          <strong>
                            {item.overall_score}%
                          </strong>

                        ) : (

                          <span
                            style={{
                              color:
                                'var(--text-dim)'
                            }}
                          >
                            —
                          </span>

                        )}

                      </td>


                      <td
                        style={{
                          padding: '14px 16px'
                        }}
                      >

                        {item.completed ? (

                          <span className="badge badge-emerald">
                            Completed
                          </span>

                        ) : (

                          <span className="badge badge-amber">
                            Pending
                          </span>

                        )}

                      </td>


                      <td
                        style={{
                          padding: '14px 16px',
                          color:
                            'var(--text-dim)'
                        }}
                      >

                        {item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleDateString()
                          : '—'}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}


          {/* ========================================= */}
          {/* QUESTIONS TAB */}
          {/* ========================================= */}

          {activeTab === 'questions' && (

            <div
              style={{
                overflowX: 'auto'
              }}
            >

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '0.9rem'
                }}
              >

                <thead>

                  <tr
                    style={{
                      borderBottom:
                        '1px solid var(--border-color)',
                      color:
                        'var(--text-dim)',
                      fontSize:
                        '0.75rem',
                      textTransform:
                        'uppercase'
                    }}
                  >

                    <th style={{ padding: '12px 16px' }}>
                      ID
                    </th>

                    <th style={{ padding: '12px 16px' }}>
                      Job Role
                    </th>

                    <th style={{ padding: '12px 16px' }}>
                      Category
                    </th>

                    <th style={{ padding: '12px 16px' }}>
                      Difficulty
                    </th>

                    <th style={{ padding: '12px 16px' }}>
                      Question
                    </th>

                    <th style={{ padding: '12px 16px' }}>
                      Keywords
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {questionsList.map((q) => (

                    <tr
                      key={q.id}
                      style={{
                        borderBottom:
                          '1px solid rgba(255,255,255,0.04)'
                      }}
                    >

                      <td
                        style={{
                          padding: '14px 16px',
                          color:
                            'var(--text-dim)',
                          fontFamily:
                            'var(--font-mono)'
                        }}
                      >
                        #{q.id}
                      </td>


                      <td
                        style={{
                          padding: '14px 16px',
                          fontWeight: 600,
                          color: '#ffffff'
                        }}
                      >
                        {q.job_role}
                      </td>


                      <td
                        style={{
                          padding: '14px 16px'
                        }}
                      >
                        <span className="badge badge-purple">
                          {q.category}
                        </span>
                      </td>


                      <td
                        style={{
                          padding: '14px 16px'
                        }}
                      >
                        {getDifficultyBadge(
                          q.difficulty
                        )}
                      </td>


                      <td
                        style={{
                          padding: '14px 16px',
                          color:
                            'var(--text-muted)',
                          minWidth: '280px'
                        }}
                      >
                        {q.question_text}
                      </td>


                      <td
                        style={{
                          padding: '14px 16px',
                          color: '#38bdf8',
                          fontSize:
                            '0.8rem',
                          minWidth:
                            '200px'
                        }}
                      >
                        {q.expected_keywords}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  );
};

export default AdminDashboard;