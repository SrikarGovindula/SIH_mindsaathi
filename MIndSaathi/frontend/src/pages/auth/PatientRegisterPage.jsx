import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerPatient } from '../../api/authApi';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function PatientRegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    preferred_language: 'English',

    emergency_contact_name: '',
    emergency_contact_phone: '',

    caretaker_relationship: '',

    password: '',
    password_confirm: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitationCode, setInvitationCode] = useState(null);
  const [registered, setRegistered] = useState(false);

  const update = (key, value) => {
    setFormData((previous) => ({
      ...previous,
      [key]: value,
    }));

    // Clear error while user edits the form.
    if (error) {
      setError('');
    }
  };

  const formatApiError = (data) => {
    if (!data) {
      return 'Registration failed. Please try again.';
    }

    if (typeof data === 'string') {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    const messages = [];

    Object.entries(data).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        messages.push(`${field}: ${value.join(', ')}`);
      } else if (typeof value === 'string') {
        messages.push(`${field}: ${value}`);
      } else {
        messages.push(`${field}: ${JSON.stringify(value)}`);
      }
    });

    return messages.length
      ? messages.join(' | ')
      : 'Registration failed. Please check your details.';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await registerPatient(formData);

      const code = response.data?.caretaker_invitation_code;

      if (code) {
        setInvitationCode(code);
        setRegistered(true);
        return;
      }

      navigate('/login');
    } catch (err) {
      console.error('Patient registration error:', err);
      console.error('Backend response:', err.response?.data);

      setError(
        formatApiError(
          err.response?.data
        )
      );
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div style={{ maxWidth: '700px', margin: '40px auto' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h1>Registration Complete 🎉</h1>

          <p>
            Your patient account has been created successfully.
          </p>

          {invitationCode && (
            <>
              <p>
                Share this caretaker invitation code with your
                primary caretaker:
              </p>

              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  letterSpacing: 5,
                  margin: '24px 0',
                }}
              >
                {invitationCode}
              </div>

              <p>This code expires in 7 days.</p>
            </>
          )}

          <button
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto' }}>
      <div className="card">
        <h1>Register as Patient</h1>

        <p>
          Create your account and optionally generate the first
          caretaker invitation.
        </p>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Username"
            required
            value={formData.username}
            onChange={(e) => update('username', e.target.value)}
          />

          <label>First Name</label>
          <input
            type="text"
            placeholder="First Name"
            required
            value={formData.first_name}
            onChange={(e) => update('first_name', e.target.value)}
          />

          <label>Last Name</label>
          <input
            type="text"
            placeholder="Last Name"
            required
            value={formData.last_name}
            onChange={(e) => update('last_name', e.target.value)}
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Email (optional)"
            value={formData.email}
            onChange={(e) => update('email', e.target.value)}
          />

          <label>Phone</label>
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => update('phone', e.target.value)}
          />

          <label>Date of Birth</label>
          <input
            type="date"
            required
            value={formData.date_of_birth}
            onChange={(e) =>
              update('date_of_birth', e.target.value)
            }
          />

          <label>Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => update('gender', e.target.value)}
          >
            <option value="">Prefer not to say</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>

          <label>Address</label>
          <input
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) => update('address', e.target.value)}
          />

          <label>Preferred Language</label>
          <input
            type="text"
            placeholder="Preferred language"
            value={formData.preferred_language}
            onChange={(e) =>
              update('preferred_language', e.target.value)
            }
          />

          <h3>Emergency Contact</h3>

          <label>Emergency Contact Name</label>
          <input
            type="text"
            placeholder="Emergency contact name"
            value={formData.emergency_contact_name}
            onChange={(e) =>
              update('emergency_contact_name', e.target.value)
            }
          />

          <label>Emergency Contact Phone</label>
          <input
            type="tel"
            placeholder="Emergency contact phone"
            value={formData.emergency_contact_phone}
            onChange={(e) =>
              update('emergency_contact_phone', e.target.value)
            }
          />

          <h3>Primary Caretaker</h3>

          <label>Relationship</label>
          <input
            type="text"
            placeholder="e.g. Son, Daughter, Spouse"
            value={formData.caretaker_relationship}
            onChange={(e) =>
              update('caretaker_relationship', e.target.value)
            }
          />

          <h3>Account Password</h3>

          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            required
            minLength={8}
            value={formData.password}
            onChange={(e) =>
              update('password', e.target.value)
            }
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm Password"
            required
            minLength={8}
            value={formData.password_confirm}
            onChange={(e) =>
              update('password_confirm', e.target.value)
            }
          />

          <button
            type="submit"
            className="btn btn-success"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register Patient'}
          </button>
        </form>
      </div>
    </div>
  );
}