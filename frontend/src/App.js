import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function App() {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobs, setJobs] = useState([]);

  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [notes, setNotes] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [editingJobId, setEditingJobId] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
const [authName, setAuthName] = useState("");
const [authEmail, setAuthEmail] = useState("");
const [authPassword, setAuthPassword] = useState("");
const [authError, setAuthError] = useState("");
const [token, setToken] = useState(localStorage.getItem("token") || "");

const [showLanding, setShowLanding] = useState(true);

const handleAuth = async (e) => {
  e.preventDefault();

  try {
    const endpoint = isLoginMode ? "login" : "register";

    const payload = isLoginMode
      ? {
          email: authEmail,
          password: authPassword,
        }
      : {
          name: authName,
          email: authEmail,
          password: authPassword,
        };

   const response = await axios.post(
  `https://trackmyjob-geau.onrender.com/${endpoint}`,
  payload
);

    if (isLoginMode) {
      localStorage.setItem("token", response.data.token);

      setToken(response.data.token);

      alert("Login successful");

      fetchJobs(response.data.token);
    } else {
  alert("Registration successful");

  setAuthName("");
  setAuthEmail("");
  setAuthPassword("");
  setIsLoginMode(true);
}
  } catch (error) {
  console.log(error);

  if (isLoginMode) {
    setAuthError("Email or password is incorrect");

    setAuthEmail("");
    setAuthPassword("");
  } else {
    setAuthError("Registration failed. Please try again.");
  }
}
};
  const totalJobs = jobs.length;

  const appliedJobs = jobs.filter(
    (job) => job.status === "Applied"
  ).length;

  const interviewJobs = jobs.filter(
    (job) => job.status === "Interview Scheduled"
  ).length;

  const rejectedJobs = jobs.filter(
    (job) => job.status === "Rejected"
  ).length;

  const offerReceivedJobs = jobs.filter(
  (job) => job.status === "Offer Received"
).length;

  const chartData = [
  {
    status: "Applied",
    count: appliedJobs,
  },
  {
    status: "Interview",
    count: interviewJobs,
  },
  {
    status: "Rejected",
    count: rejectedJobs,
  },
  {
    status: "Offer",
    count: offerReceivedJobs,
  },
];

  const filteredJobs = jobs.filter((job) => {
  const matchesSearch =
    job.company_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    job.job_title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

  const matchesStatus =
    statusFilter === "All" ||
    job.status === statusFilter;

  return matchesSearch && matchesStatus;
});

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingJobId) {
  const response = await axios.put(
    `https://trackmyjob-geau.onrender.com/job-applications/${editingJobId}`,
    {
      company_name: companyName,
      job_title: jobTitle,
      location: location,
      job_type: jobType,
      status: "Applied",
      applied_date: appliedDate,
      job_link: jobLink,
      notes: notes,
    }
  );

  console.log(response.data);

  alert("Job application updated successfully");

  setEditingJobId(null);
} else {
  const response = await axios.post(
    "https://trackmyjob-geau.onrender.com/job-applications",
    {
      company_name: companyName,
      job_title: jobTitle,
      location: location,
      job_type: jobType,
      status: "Applied",
      applied_date: appliedDate,
      job_link: jobLink,
      notes: notes,
    }
  );

  console.log(response.data);

  alert("Job application added successfully");
}

      setCompanyName("");
      setJobTitle("");
      setLocation("");
      setJobType("");
      setAppliedDate("");
      setJobLink("");
      setNotes("");

      fetchJobs();
    } catch (error) {
      console.log(error);

      alert("Failed to add job application");
    }
  };

  const fetchJobs = async () => {
  try {
    const savedToken = localStorage.getItem("token");

    const response = await axios.get(
      "https://trackmyjob-geau.onrender.com/job-applications",
      {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      }
    );

    setJobs(response.data);
  } catch (error) {
    console.log(error);
  }
};

  const deleteJob = async (id) => {
    try {
      await axios.delete(
        `https://trackmyjob-geau.onrender.com/job-applications/${id}`
      );

      alert("Job application deleted successfully");

      fetchJobs();
    } catch (error) {
      console.log(error);

      alert("Failed to delete job application");
    }
  };

  const updateJobStatus = async (job, newStatus) => {
  try {
    await axios.put(
      `https://trackmyjob-geau.onrender.com/job-applications/${job.id}`,
      {
        company_name: job.company_name,
        job_title: job.job_title,
        location: job.location,
        job_type: job.job_type,
        status: newStatus,
        applied_date: job.applied_date,
        job_link: job.job_link,
        notes: job.notes,
      }
    );

    alert("Job status updated successfully");

    fetchJobs();
  } catch (error) {
    console.log(error);

    alert("Failed to update status");
  }
};
  const startEditJob = (job) => {
  setEditingJobId(job.id);

  setCompanyName(job.company_name);
  setJobTitle(job.job_title);
  setLocation(job.location);
  setJobType(job.job_type);
  setAppliedDate(job.applied_date ? job.applied_date.slice(0, 10) : "");
  setJobLink(job.job_link);
  setNotes(job.notes);
};

useEffect(() => {
  const savedToken = localStorage.getItem("token");

  if (savedToken) {
    setToken(savedToken);
    fetchJobs();
  }
}, []);

if (showLanding && !token) {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <h2>TrackMyJob</h2>

        <div>
          <button
            className="nav-link-btn"
            onClick={() => {
              setShowLanding(false);
              setIsLoginMode(true);
            }}
          >
            Sign In
          </button>

          <button
            className="nav-primary-btn"
            onClick={() => {
              setShowLanding(false);
              setIsLoginMode(false);
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">AI-Powered Job Tracking</span>

          <h1>Track smarter. Apply faster. Stay organized.</h1>

          <p>
            Manage applications, monitor interview progress, and stay focused on
            landing your next opportunity — all in one clean dashboard.
          </p>

          <button
            className="hero-btn"
            onClick={() => {
              setShowLanding(false);
              setIsLoginMode(false);
            }}
          >
            Start Tracking Now
          </button>
        </div>

        <div className="hero-preview-card">
          <h3>Application Dashboard</h3>
          <div className="preview-row">
          <span>Total Applications</span>
            <strong>0</strong>
            </div>
              <div className="preview-row">
              <span>Interviews</span>
              <strong>0</strong>
              </div>
              <div className="preview-row">
              <span>Offers</span>
              <strong>0</strong>
              </div>
        </div>
      </section>
      <section className="features-section">

  <div className="feature-card">
    <h3>Track Applications</h3>

    <p>
      Organize all your applications in one smart dashboard.
    </p>
  </div>

  <div className="feature-card">
    <h3>Interview Management</h3>

    <p>
      Track interviews, follow-ups, and hiring progress easily.
    </p>
  </div>

  <div className="feature-card">
    <h3>Analytics Dashboard</h3>

    <p>
      Monitor offers, rejections, and application statistics.
    </p>
  </div>

</section>
    </div>
  );
}



if (!token) {
  return (
    <div className="container">

      <button
      className="back-home-btn"
        onClick={() => setShowLanding(true)}>
             ← Back to Home
            </button>
      <h1>{isLoginMode ? "Login" : "Register"}</h1>

      {authError && (
        <div className="auth-error">
           {authError}
        </div>
        )}

      <form onSubmit={handleAuth}>
        {!isLoginMode && (
          <div>
            <label>Name:</label>

            <input
              type="text"
              value={authName}
              onChange={(e) => setAuthName(e.target.value)}
            />
          </div>
        )}

        <br />

        <div>
          <label>Email:</label>

          <input
            type="email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Password:</label>

          <input
            type="password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">
          {isLoginMode ? "Login" : "Register"}
        </button>

        <br />
        <br />

        <button
          type="button"
          onClick={() => {
          setIsLoginMode(!isLoginMode);
          setAuthName("");
          setAuthEmail("");
          setAuthPassword("");
          }}
        >
          Switch to {isLoginMode ? "Register" : "Login"}
        </button>
      </form>
    </div>
  );
}

  return (

    
    <div className="container">
      <div className="navbar">
  <h1>TrackMyJob</h1>

  <button
    className="logout-btn"
    onClick={() => {
      localStorage.removeItem("token");
      setToken("");
      setJobs([]);
      setAuthName("");
      setAuthEmail("");
      setAuthPassword("");
    }}
  >
    Logout
  </button>
</div>

      <div className="dashboard">
        <div className="stat-card">
          <h3>Total Applications</h3>
          <p>{totalJobs}</p>
        </div>

        <div className="stat-card">
          <h3>Applied</h3>
          <p>{appliedJobs}</p>
        </div>

        <div className="stat-card">
          <h3>Interview Scheduled</h3>
          <p>{interviewJobs}</p>
        </div>

        <div className="stat-card">
                <h3>Offer Received</h3>
            <p>{offerReceivedJobs}</p>
            </div>

        <div className="stat-card">
          <h3>Rejected</h3>
          <p>{rejectedJobs}</p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by company or title"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
>
  <option value="All">All</option>
  <option value="Applied">Applied</option>
  <option value="Interview Scheduled">Interview Scheduled</option>
  <option value="Rejected">Rejected</option>
</select>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Company Name:</label>

          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Job Title:</label>

          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Location:</label>

          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Job Type:</label>

          <input
            type="text"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Applied Date:</label>

          <input
            type="date"
            value={appliedDate}
            onChange={(e) => setAppliedDate(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Job Link:</label>

          <input
            type="text"
            value={jobLink}
            onChange={(e) => setJobLink(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Notes:</label>

          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <br />

        <button type="submit" className="add-btn">
            {editingJobId ? "Update Job" : "Add Job"}
            </button>
      </form>

      <hr />

      <h2>Job Analytics</h2>

<BarChart width={500} height={300} data={chartData}>
  <CartesianGrid strokeDasharray="3 3" />

  <XAxis dataKey="status" />

  <YAxis />

  <Tooltip />

  <Bar dataKey="count" fill="#8884d8" />
</BarChart>

      <h2>Job Applications</h2>

          {filteredJobs.length === 0 && (
  <div className="empty-state">
    <h3>No job applications found</h3>
    <p>Add your first job application to start tracking your progress.</p>
  </div>
)}

      {filteredJobs.map((job) => (
        <div key={job.id} className="job-card">


         <h2 className="company-title">{job.company_name}</h2>


          <h3 className="job-title">{job.job_title}</h3>

          <p>
          <strong>Status:</strong>{" "}
          <span className={`status-badge ${job.status.replaceAll(" ", "-").toLowerCase()}`}>
             {job.status}
            </span>
            </p>

          <p className="job-info">📍 {job.location}</p>

        <p className="job-info">💼 {job.job_type}</p>

         <p className="job-info">
           📅 {job.applied_date ? job.applied_date.slice(0, 10) : ""}
          </p>

          <p>
            <strong>Job Link:</strong> {job.job_link}
          </p>

          <p>
            <strong>Notes:</strong> {job.notes}
          </p>

          <button
            className="delete-btn"
            onClick={() => deleteJob(job.id)}
          >
            Delete
          </button>

          <div className="status-buttons">
  <button
    className="update-btn"
    onClick={() => updateJobStatus(job, "Interview Scheduled")}
  >
    Interview Scheduled
  </button>

  <button
    className="update-btn"
    onClick={() => updateJobStatus(job, "Rejected")}
  >
    Rejected
  </button>

  <button
    className="update-btn"
    onClick={() => updateJobStatus(job, "Offer Received")}
  >
    Offer Received
  </button>
</div>

          <button onClick={() => startEditJob(job)}>
           Edit
            </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;