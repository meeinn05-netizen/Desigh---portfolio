import { useState, useEffect, type FormEvent, type ChangeEvent, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  Archive, 
  Briefcase, 
  Mail, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  ChevronRight, 
  ChevronDown,
  LogOut,
  LayoutDashboard,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Check,
  X,
  ExternalLink,
  Menu,
  Instagram
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- API Service ---
const API_URL = window.location.origin;
const api = {
  get: async (url: string) => {
    const res = await fetch(`${API_URL}${url}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }
    const text = await res.text();
    throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}...`);
  },
  post: async (url: string, data: any, token?: string) => {
    const res = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }
    const text = await res.text();
    throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}...`);
  },
  put: async (url: string, data: any, token?: string) => {
    const res = await fetch(`${API_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }
    const text = await res.text();
    throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}...`);
  },
  delete: async (url: string, token?: string) => {
    const res = await fetch(`${API_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }
    const text = await res.text();
    throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}...`);
  },
  upload: async (file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formData
    });
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }
    const text = await res.text();
    throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}...`);
  }
};

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'About', path: '/about', icon: User },
    { name: 'Archive', path: '/archive', icon: Archive },
    { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold tracking-tighter text-black">
            ARCHIVE<span className="text-black">.</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-black",
                  location.pathname === item.path ? "text-black border-b border-black" : "text-zinc-400"
                )}
              >
                {item.name}
              </Link>
            ))}
            <Link to="/admin/login" className="text-zinc-200 hover:text-black transition-colors">
              <Settings size={18} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-600">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-black/5 px-4 pt-2 pb-6 space-y-1"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:bg-zinc-50"
              >
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-zinc-50 border-t border-black/5 py-12">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <p className="text-sm text-zinc-400">© 2026 Archive Portfolio. All rights reserved.</p>
    </div>
  </footer>
);

// --- Pages ---

const HomePage = () => {
  const [content, setContent] = useState<any>({});
  const [featured, setFeatured] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [contentData, featuredData, recentData] = await Promise.all([
          api.get('/api/content'),
          api.get('/api/assignments?featured=true'),
          api.get('/api/assignments?status=published')
        ]);
        setContent(contentData);
        setFeatured(featuredData);
        setRecent(recentData.slice(0, 3));
      } catch (error) {
        console.error('Failed to load home data:', error);
      }
    };
    loadData();
  }, []);

  return (
    <div className="pt-24 pb-20">
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black mb-8 leading-tight">
            Design Archive & <br />
            <span className="italic">Creative Journey.</span>
          </h1>
          <p className="text-xl text-zinc-500 leading-relaxed font-light">
            {content.home_intro}
          </p>
        </motion.div>
      </section>

      {/* Featured Projects */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
          <Link to="/portfolio" className="text-black font-medium flex items-center gap-1 hover:underline underline-offset-4">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {featured.map((item) => (
            <Link key={item.id} to={`/assignment/${item.id}`} className="group block">
              <div className="aspect-[16/10] bg-zinc-50 rounded-lg overflow-hidden mb-6 border border-zinc-100">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-200">No Image</div>
                )}
              </div>
              <h3 className="text-2xl font-bold group-hover:underline underline-offset-4 transition-all">{item.title}</h3>
              <p className="text-zinc-400 mt-2 line-clamp-2 font-light">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Assignments */}
      <section className="bg-white py-24 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Recent Assignments</h2>
            <Link to="/archive" className="text-black font-medium flex items-center gap-1 hover:underline underline-offset-4">
              Go to Archive <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {recent.map((item) => (
              <Link key={item.id} to={`/assignment/${item.id}`} className="flex items-center p-6 bg-zinc-50 rounded-lg border border-transparent hover:border-black transition-all">
                <div className="w-20 h-20 bg-white rounded overflow-hidden flex-shrink-0 mr-8 border border-zinc-100">
                  {item.thumbnail && <img src={item.thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-xl">{item.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <ChevronRight className="text-zinc-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const AboutPage = () => {
  const [content, setContent] = useState<any>({});
  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await api.get('/api/content');
        setContent(data);
      } catch (error) {
        console.error('Failed to load about content:', error);
      }
    };
    loadContent();
  }, []);

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="aspect-[3/4] bg-zinc-100 rounded-3xl overflow-hidden border border-black/5 mb-8">
            <img src="https://picsum.photos/seed/profile/800/1200" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-bold mb-8">About Me</h1>
          <div className="prose prose-zinc max-w-none text-zinc-600 leading-relaxed mb-12">
            <p className="whitespace-pre-wrap">{content.about_bio}</p>
          </div>
          
          <h2 className="text-xl font-bold mb-6">Skills & Tools</h2>
          <div className="flex flex-wrap gap-3">
            {['Figma', 'Adobe CC (Photoshop, Illustrator)'].map(skill => (
              <span key={skill} className="px-4 py-2 bg-zinc-50 text-black border border-zinc-100 rounded-full text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const ArchivePage = () => {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const loadArchive = async () => {
      try {
        const [semestersData, classesData] = await Promise.all([
          api.get('/api/semesters'),
          api.get('/api/classes')
        ]);
        setSemesters(semestersData);
        setClasses(classesData);
      } catch (error) {
        console.error('Failed to load archive data:', error);
      }
    };
    loadArchive();
  }, []);

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
      <h1 className="text-4xl font-bold mb-12">Archive</h1>
      <div className="space-y-12">
        {semesters.map(semester => (
          <div key={semester.id} className="border-t border-black/5 pt-8">
            <div className="flex items-baseline gap-4 mb-8">
              <h2 className="text-2xl font-bold">{semester.title}</h2>
              <span className="text-zinc-400 text-sm">{semester.year} {semester.term}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {classes.filter(c => c.semester_id === semester.id).map(cls => (
                <Link key={cls.id} to={`/class/${cls.id}`} className="p-8 bg-white rounded-lg border border-zinc-100 hover:border-black transition-all group">
                  <h3 className="text-xl font-bold mb-2 group-hover:underline underline-offset-4">{cls.title}</h3>
                  <p className="text-zinc-400 text-sm line-clamp-2 font-light">{cls.description}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClassDetailPage = () => {
  const { id } = useParams();
  const [cls, setCls] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    const loadClassDetails = async () => {
      try {
        const [classesData, assignmentsData] = await Promise.all([
          api.get('/api/classes'),
          api.get('/api/assignments?status=published')
        ]);
        setCls(classesData.find((c: any) => c.id === Number(id)));
        setAssignments(assignmentsData.filter((a: any) => a.class_id === Number(id)));
      } catch (error) {
        console.error('Failed to load class details:', error);
      }
    };
    loadClassDetails();
  }, [id]);

  if (!cls) return null;

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
      <Link to="/archive" className="text-zinc-400 hover:text-zinc-600 mb-8 inline-flex items-center gap-1">
        <ChevronRight className="rotate-180" size={16} /> Back to Archive
      </Link>
      <h1 className="text-4xl font-bold mb-4">{cls.title}</h1>
      <p className="text-zinc-500 max-w-2xl mb-12">{cls.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {assignments.map(item => (
          <Link key={item.id} to={`/assignment/${item.id}`} className="group">
            <div className="aspect-square bg-zinc-50 rounded-lg overflow-hidden mb-4 border border-zinc-100">
              {item.thumbnail && <img src={item.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />}
            </div>
            <h3 className="font-bold group-hover:underline underline-offset-4">{item.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

const AssignmentDetailPage = () => {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const data = await api.get(`/api/assignments/${id}`);
        setItem(data);
      } catch (error) {
        console.error('Failed to load assignment details:', error);
      }
    };
    loadAssignment();
  }, [id]);

  if (!item) return null;

  const images = JSON.parse(item.images || '[]');

  return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-4">
      <header className="mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">{item.title}</h1>
        <div className="flex flex-wrap gap-4 text-xs font-medium uppercase tracking-widest text-zinc-400">
          <div className="px-4 py-2 bg-zinc-50 rounded border border-zinc-100">{new Date(item.created_at).toLocaleDateString()}</div>
          <div className="px-4 py-2 bg-zinc-900 text-white rounded">{item.tools}</div>
        </div>
      </header>

      <div className="aspect-video bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100 mb-20">
        {item.thumbnail && <img src={item.thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
      </div>

      <div className="prose prose-zinc max-w-none mb-24">
        <h2 className="text-3xl font-bold mb-8 tracking-tight">Project Overview</h2>
        <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap text-lg font-light">{item.description}</p>
      </div>

      <div className="space-y-12">
        {images.map((img: string, idx: number) => (
          <div key={idx} className="rounded-lg overflow-hidden border border-zinc-100 bg-zinc-50">
            <img src={img} alt="" className="w-full h-auto" referrerPolicy="no-referrer" />
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const res = await api.post('/api/login', { username, password });
    if (res.token) {
      localStorage.setItem('admin_token', res.token);
      navigate('/admin/dashboard');
    } else {
      setError('로그인 정보가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-sm border border-black/5">
        <h1 className="text-2xl font-bold text-center mb-8">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:border-black outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:border-black outline-none"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full py-4 bg-black text-white rounded-lg font-bold hover:bg-zinc-800 transition-colors">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) navigate('/admin/login');
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Semesters', path: '/admin/semesters', icon: BookOpen },
    { name: 'Classes', path: '/admin/classes', icon: FileText },
    { name: 'Assignments', path: '/admin/assignments', icon: ImageIcon },
    { name: 'Site Content', path: '/admin/content', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-black/5 flex flex-col">
        <div className="p-6 border-b border-black/5">
          <Link to="/" className="text-xl font-bold tracking-tighter">ADMIN PANEL</Link>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-500 hover:bg-zinc-50 hover:text-black transition-colors"
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-black/5">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-grow p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Semesters', value: '4', color: 'bg-zinc-50 text-black' },
          { label: 'Total Classes', value: '12', color: 'bg-zinc-50 text-black' },
          { label: 'Total Assignments', value: '48', color: 'bg-zinc-50 text-black' },
        ].map(stat => (
          <div key={stat.label} className="p-8 bg-white rounded-lg border border-zinc-100">
            <p className="text-sm font-medium text-zinc-400 mb-2">{stat.label}</p>
            <p className={cn("text-4xl font-bold", stat.color.split(' ')[1])}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminAssignments = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<any>({
    title: '', description: '', class_id: '', tools: '', status: 'published', is_featured: false, thumbnail: '', images: []
  });
  const token = localStorage.getItem('admin_token') || '';

  const fetchData = () => {
    api.get('/api/assignments').then(setAssignments);
    api.get('/api/classes').then(setClasses);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      }
    };
    loadData();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (current.id) {
        res = await api.put(`/api/assignments/${current.id}`, current, token);
      } else {
        res = await api.post('/api/assignments', current, token);
      }
      
      if (res.error) {
        alert(`Error: ${res.error}`);
      } else {
        setIsEditing(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to save assignment:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await api.delete(`/api/assignments/${id}`, token);
      fetchData();
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, field: 'thumbnail' | 'images') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (field === 'thumbnail') {
      const res = await api.upload(files[0], token);
      setCurrent({ ...current, thumbnail: res.url });
    } else {
      const uploadPromises = (Array.from(files) as File[]).map(file => api.upload(file, token));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(res => res.url);
      const images = Array.isArray(current.images) ? current.images : JSON.parse(current.images || '[]');
      setCurrent({ ...current, images: [...images, ...newUrls] });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Assignments</h1>
        <button onClick={() => { setCurrent({ title: '', description: '', class_id: '', tools: '', status: 'published', is_featured: false, thumbnail: '', images: [] }); setIsEditing(true); }} className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-zinc-800 transition-colors">
          <Plus size={20} /> Add Assignment
        </button>
      </div>

      {isEditing ? (
        <div className="bg-white p-10 rounded-lg border border-zinc-100 max-w-4xl">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="block text-sm font-bold mb-2">Title</label>
                <input type="text" value={current.title} onChange={e => setCurrent({...current, title: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:border-black outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Class</label>
                <select value={current.class_id} onChange={e => setCurrent({...current, class_id: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:border-black outline-none" required>
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Tools</label>
                <input type="text" value={current.tools} onChange={e => setCurrent({...current, tools: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:border-black outline-none" placeholder="e.g. Figma, React" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold mb-2">Description</label>
                <textarea value={current.description} onChange={e => setCurrent({...current, description: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:border-black outline-none h-40" />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-4">Thumbnail</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-zinc-50 px-4 py-2 rounded border border-zinc-200 text-sm hover:bg-zinc-100 transition-colors">
                    Upload File
                    <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'thumbnail')} />
                  </label>
                  {current.thumbnail && <img src={current.thumbnail} className="w-16 h-16 object-cover rounded border border-zinc-200" />}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-4">Project Images (Multiple)</label>
                <div className="space-y-4">
                  <label className="cursor-pointer bg-zinc-50 px-4 py-2 rounded border border-zinc-200 text-sm hover:bg-zinc-100 transition-colors inline-block">
                    Add Images
                    <input type="file" className="hidden" multiple onChange={e => handleFileUpload(e, 'images')} />
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(Array.isArray(current.images) ? current.images : JSON.parse(current.images || '[]')).map((img: string, idx: number) => (
                      <div key={idx} className="relative group aspect-square rounded border border-zinc-200 overflow-hidden">
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => {
                            const imgs = Array.isArray(current.images) ? current.images : JSON.parse(current.images || '[]');
                            setCurrent({...current, images: imgs.filter((_: any, i: number) => i !== idx)});
                          }}
                          className="absolute top-1 right-1 bg-black text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12 col-span-2 py-4 border-y border-zinc-50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={current.is_featured} onChange={e => setCurrent({...current, is_featured: e.target.checked})} className="w-5 h-5 accent-black" />
                  <span className="text-sm font-bold">Featured Project</span>
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">Status:</span>
                  <select value={current.status} onChange={e => setCurrent({...current, status: e.target.value})} className="px-3 py-1 rounded border border-zinc-200 text-sm font-medium">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <button type="submit" className="px-10 py-3 bg-black text-white rounded-lg font-bold hover:bg-zinc-800 transition-all">Save Project</button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-10 py-3 bg-zinc-50 text-zinc-500 rounded-lg font-bold hover:bg-zinc-100 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-zinc-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-widest text-zinc-400">Title</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-widest text-zinc-400">Status</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-widest text-zinc-400">Featured</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {assignments.map(item => (
                <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-5 font-bold">{item.title}</td>
                  <td className="px-6 py-5">
                    <span className={cn("px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter", item.status === 'published' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400')}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">{item.is_featured ? <Check className="text-black" size={18} /> : <X className="text-zinc-200" size={18} />}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { 
                        const itemToEdit = { 
                          ...item, 
                          images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images 
                        };
                        setCurrent(itemToEdit); 
                        setIsEditing(true); 
                      }} className="p-2 text-zinc-300 hover:text-black transition-colors"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><AboutPage /><Footer /></>} />
        <Route path="/archive" element={<><Navbar /><ArchivePage /><Footer /></>} />
        <Route path="/class/:id" element={<><Navbar /><ClassDetailPage /><Footer /></>} />
        <Route path="/assignment/:id" element={<><Navbar /><AssignmentDetailPage /><Footer /></>} />
        <Route path="/portfolio" element={<><Navbar /><div className="pt-32 px-4 max-w-7xl mx-auto"><h1 className="text-4xl font-bold mb-12">Portfolio</h1><div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20"><FeaturedPortfolio /></div></div><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><ContactPage /><Footer /></>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/assignments" element={<AdminLayout><AdminAssignments /></AdminLayout>} />
        <Route path="/admin/semesters" element={<AdminLayout><AdminSemesters /></AdminLayout>} />
        <Route path="/admin/classes" element={<AdminLayout><AdminClasses /></AdminLayout>} />
        <Route path="/admin/content" element={<AdminLayout><AdminContent /></AdminLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

const AdminSemesters = () => {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<any>({ title: '', year: new Date().getFullYear(), term: '1학기', sort_order: 0 });
  const token = localStorage.getItem('admin_token') || '';

  const fetchData = () => api.get('/api/semesters').then(setSemesters);
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error('Failed to fetch semesters:', error);
      }
    };
    loadData();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (current.id) await api.put(`/api/semesters/${current.id}`, current, token);
    else await api.post('/api/semesters', current, token);
    setIsEditing(false);
    fetchData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Semesters</h1>
        <button onClick={() => { setCurrent({ title: '', year: new Date().getFullYear(), term: '1학기', sort_order: 0 }); setIsEditing(true); }} className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-zinc-800 transition-colors">
          <Plus size={20} /> Add Semester
        </button>
      </div>
      {isEditing ? (
        <div className="bg-white p-10 rounded-lg border border-zinc-100 max-w-md">
          <form onSubmit={handleSave} className="space-y-4">
            <input type="text" placeholder="Title (e.g. 2026-1)" value={current.title} onChange={e => setCurrent({...current, title: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-zinc-200" required />
            <input type="number" placeholder="Year" value={current.year} onChange={e => setCurrent({...current, year: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-zinc-200" required />
            <select value={current.term} onChange={e => setCurrent({...current, term: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-zinc-200">
              <option value="1학기">1학기</option>
              <option value="여름학기">여름학기</option>
              <option value="2학기">2학기</option>
              <option value="겨울학기">겨울학기</option>
            </select>
            <div className="flex gap-4 pt-4">
              <button type="submit" className="px-8 py-3 bg-black text-white rounded-lg font-bold">Save</button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3 bg-zinc-50 text-zinc-500 rounded-lg font-bold">Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {semesters.map(s => (
            <div key={s.id} className="p-6 bg-white rounded-lg border border-zinc-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{s.title}</h3>
                <p className="text-sm text-zinc-400 font-light">{s.year} {s.term}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setCurrent(s); setIsEditing(true); }} className="p-2 text-zinc-300 hover:text-black transition-colors"><Edit size={18} /></button>
                <button onClick={async () => { if(confirm('삭제하시겠습니까?')) { await api.delete(`/api/semesters/${s.id}`, token); fetchData(); } }} className="p-2 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminClasses = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<any>({ title: '', description: '', semester_id: '' });
  const token = localStorage.getItem('admin_token') || '';

  const fetchData = () => {
    api.get('/api/classes').then(setClasses);
    api.get('/api/semesters').then(setSemesters);
  };
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      }
    };
    loadData();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (current.id) await api.put(`/api/classes/${current.id}`, current, token); // Note: I need to add PUT /api/classes in server.ts
    else await api.post('/api/classes', current, token);
    setIsEditing(false);
    fetchData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Classes</h1>
        <button onClick={() => { setCurrent({ title: '', description: '', semester_id: '' }); setIsEditing(true); }} className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-zinc-800 transition-colors">
          <Plus size={20} /> Add Class
        </button>
      </div>
      {isEditing ? (
        <div className="bg-white p-10 rounded-lg border border-zinc-100 max-w-md">
          <form onSubmit={handleSave} className="space-y-4">
            <select value={current.semester_id} onChange={e => setCurrent({...current, semester_id: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-zinc-200" required>
              <option value="">Select Semester</option>
              {semesters.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
            <input type="text" placeholder="Class Title" value={current.title} onChange={e => setCurrent({...current, title: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-zinc-200" required />
            <textarea placeholder="Description" value={current.description} onChange={e => setCurrent({...current, description: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-zinc-200 h-24" />
            <div className="flex gap-4 pt-4">
              <button type="submit" className="px-8 py-3 bg-black text-white rounded-lg font-bold">Save</button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3 bg-zinc-50 text-zinc-500 rounded-lg font-bold">Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map(c => (
            <div key={c.id} className="p-6 bg-white rounded-lg border border-zinc-100 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{c.title}</h3>
                <p className="text-xs text-black font-bold mb-2 uppercase tracking-widest">{semesters.find(s => s.id === c.semester_id)?.title}</p>
                <p className="text-sm text-zinc-400 line-clamp-2 font-light">{c.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setCurrent(c); setIsEditing(true); }} className="p-2 text-zinc-300 hover:text-black transition-colors"><Edit size={18} /></button>
                <button onClick={async () => { if(confirm('삭제하시겠습니까?')) { await api.delete(`/api/classes/${c.id}`, token); fetchData(); } }} className="p-2 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminContent = () => {
  const [content, setContent] = useState<any>({});
  const token = localStorage.getItem('admin_token') || '';

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await api.get('/api/content');
        setContent(data);
      } catch (error) {
        console.error('Failed to load site content:', error);
      }
    };
    loadContent();
  }, []);

  const handleSave = async (key: string, value: string) => {
    await api.post('/api/content', { key, value }, token);
    alert('저장되었습니다.');
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Site Content</h1>
      <div className="space-y-8">
        <div className="bg-white p-8 rounded-lg border border-zinc-100">
          <label className="block text-sm font-bold mb-4">Home Intro Text</label>
          <textarea 
            value={content.home_intro || ''} 
            onChange={e => setContent({...content, home_intro: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-zinc-200 h-32 mb-4 focus:border-black outline-none"
          />
          <button onClick={() => handleSave('home_intro', content.home_intro)} className="bg-black text-white px-6 py-2 rounded font-bold">Save</button>
        </div>
        <div className="bg-white p-8 rounded-lg border border-zinc-100">
          <label className="block text-sm font-bold mb-4">About Bio Text</label>
          <textarea 
            value={content.about_bio || ''} 
            onChange={e => setContent({...content, about_bio: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-zinc-200 h-64 mb-4 focus:border-black outline-none"
          />
          <button onClick={() => handleSave('about_bio', content.about_bio)} className="bg-black text-white px-6 py-2 rounded font-bold">Save</button>
        </div>
      </div>
    </div>
  );
};

const FeaturedPortfolio = () => {
  const [featured, setFeatured] = useState<any[]>([]);
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await api.get('/api/assignments?featured=true');
        setFeatured(data);
      } catch (error) {
        console.error('Failed to load featured assignments:', error);
      }
    };
    loadFeatured();
  }, []);

  return (
    <>
      {featured.map(item => (
        <Link key={item.id} to={`/assignment/${item.id}`} className="group block">
          <div className="aspect-[16/10] bg-zinc-50 rounded-lg overflow-hidden mb-6 border border-zinc-100">
            {item.thumbnail && <img src={item.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />}
          </div>
          <h2 className="text-3xl font-bold mb-2 group-hover:underline underline-offset-4 transition-all">{item.title}</h2>
          <p className="text-zinc-400 line-clamp-2 font-light">{item.description}</p>
        </Link>
      ))}
    </>
  );
};

const ContactPage = () => (
  <div className="pt-32 pb-40 max-w-7xl mx-auto px-4 text-center">
    <h1 className="text-5xl font-bold mb-12">Let's Connect.</h1>
    <p className="text-xl text-zinc-500 mb-16 max-w-2xl mx-auto">
      새로운 프로젝트나 협업 제안은 언제나 환영입니다. <br />
      아래 채널을 통해 연락주세요.
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <div className="p-10 bg-zinc-50 rounded-2xl border border-zinc-100 text-left group hover:border-black transition-all">
        <div className="flex items-center gap-3 mb-4">
          <Mail size={20} className="text-zinc-400 group-hover:text-black transition-colors" />
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest group-hover:text-black transition-colors">Email</p>
        </div>
        <a href="mailto:meeinn05@sookmyung.ac.kr" className="text-xl md:text-2xl font-medium hover:text-zinc-500 transition-colors break-all">
          meeinn05@sookmyung.ac.kr
        </a>
      </div>
      
      <div className="p-10 bg-zinc-50 rounded-2xl border border-zinc-100 text-left group hover:border-black transition-all">
        <div className="flex items-center gap-3 mb-4">
          <Instagram size={20} className="text-zinc-400 group-hover:text-black transition-colors" />
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest group-hover:text-black transition-colors">Instagram</p>
        </div>
        <a href="https://instagram.com/mee_inn.5" target="_blank" rel="noopener noreferrer" className="text-xl md:text-2xl font-medium hover:text-zinc-500 transition-colors">
          @mee_inn.5
        </a>
      </div>
    </div>

    <div className="mt-16 flex justify-center gap-6">
      {['Behance', 'GitHub', 'LinkedIn'].map(sns => (
        <a key={sns} href="#" className="w-16 h-16 flex items-center justify-center bg-white border border-zinc-100 rounded-lg text-zinc-400 hover:text-black hover:border-black transition-all">
          <ExternalLink size={24} />
        </a>
      ))}
    </div>
  </div>
);
