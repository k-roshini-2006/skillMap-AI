import React, { useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import {
  BookOpen, ExternalLink, ArrowRight, CheckCircle2, Clock,
  Compass, Sparkles, TrendingUp, Award, Check
} from 'lucide-react';

// Helper function to generate direct learning links instead of search engines
const getDirectCourseUrl = (skillName, defaultUrl, platformName) => {
  const cleanSkill = (skillName || '').trim().toLowerCase();

  // 1. C++ Special Direct Link Mapping
  if (cleanSkill === 'c++' || cleanSkill === 'cpp') {
    if (platformName?.toLowerCase().includes('coursera')) {
      return 'https://www.coursera.org/courses?query=c%2B%2B';
    }
    return 'https://www.geeksforgeeks.org/cpp/c-plus-plus/';
  }

  // 2. Direct links for C# and REST API (avoid broken search URLs)
  if (cleanSkill.includes('c#') || cleanSkill.includes('csharp') || cleanSkill.includes('c sharp')) {
    return 'https://learn.microsoft.com/en-us/training/paths/get-started-c-sharp-part-1/';
  }

  if (cleanSkill.includes('rest api') || cleanSkill.includes('restful api') || cleanSkill.includes('api development') || cleanSkill === 'api') {
    return 'https://www.coursera.org/learn/apis';
  }

  // 3. Skill-specific verified course links
  if (cleanSkill.includes('cyber security') || cleanSkill.includes('cybersecurity')) {
    return 'https://www.coursera.org/learn/foundations-of-cybersecurity';
  }

  if (cleanSkill.includes('generative ai') || cleanSkill.includes('gen ai')) {
    return 'https://www.geeksforgeeks.org/courses/generative-ai-training-program';
  }

  if (cleanSkill.includes('web development') || cleanSkill.includes('web design')) {
    return 'https://www.udemy.com/course/the-complete-web-development-bootcamp/?couponCode=25BBPMXNVD35';
  }

  if (cleanSkill.includes('fintech') || cleanSkill.includes('financial technology')) {
    return 'https://www.edx.org/learn/fintech/the-university-of-texas-at-austin-fintech-overview-of-the-fintech-sector?index=rv_product_summary&queryId=3eb5b3af48ddbb16e462924c2cb24425&position=1';
  }

  // 4. Platform-specific direct destination mapping
  if (platformName?.toLowerCase().includes('coursera')) {
    return `https://www.coursera.org/courses?query=${encodeURIComponent(skillName)}`;
  }

  if (platformName?.toLowerCase().includes('geeksforgeeks') || platformName?.toLowerCase().includes('gfg')) {
    return `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(skillName)}`;
  }

  if (platformName?.toLowerCase().includes('udemy')) {
    return `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skillName)}`;
  }

  if (platformName?.toLowerCase().includes('edx')) {
    return `https://www.edx.org/search?q=${encodeURIComponent(skillName)}`;
  }

  // 5. Fallback to existing valid direct URL or GeeksforGeeks direct topic page
  if (defaultUrl && !defaultUrl.includes('google.com')) {
    return defaultUrl;
  }

  return `https://www.geeksforgeeks.org/${encodeURIComponent(cleanSkill.replace(/[^a-z0-9]/g, '-'))}/`;
};

const LearningPathPage = ({ resumeData, setResumeData, setActiveTab }) => {
  const targetRole = resumeData?.targetRole || 'Software Engineer';
  const matchScore = resumeData?.matchScore || 65;

  // Build courses dynamically from missing skills or defaults
  const [courses, setCourses] = useState(() => {
    if (resumeData?.missingSkills && resumeData.missingSkills.length > 0) {
      return resumeData.missingSkills.slice(0, 9).map((ms, idx) => {
        const skillName = ms.skill || ms.name || 'Core Skill';
        const platform = ms.coursePlatform || 'Coursera / GeeksforGeeks';
        const directUrl = getDirectCourseUrl(skillName, ms.courseUrl, platform);
        return {
          id: `course_${idx + 1}`,
          title: ms.recommendedCourse || `Mastering ${skillName}`,
          platform: platform,
          level: ms.priorityType === 'critical' ? 'Intermediate' : 'Beginner-Intermediate',
          duration: ms.duration || '4 weeks',
          aiMatch: '99%',
          skill: skillName,
          priority: ms.priority || 'Critical Priority',
          priorityType: ms.priorityType || 'critical',
          currentLevel: 45,
          targetLevel: ms.targetLevel || 85,
          status: idx === 0 ? 'Completed' : 'In Progress',
          recommendation: `Recommended because ${skillName} is a high-priority requirement for ${targetRole}.`,
          url: directUrl
        };
      });
    }
    return [
      {
        id: 'c_api',
        title: 'APIs - REST API Development',
        platform: 'Coursera',
        level: 'Beginner-Intermediate',
        duration: '4 weeks',
        aiMatch: '99%',
        skill: 'REST API',
        priority: 'Critical Priority',
        priorityType: 'critical',
        currentLevel: 45,
        targetLevel: 85,
        status: 'In Progress',
        recommendation: `Recommended because REST API development is an important requirement for ${targetRole}.`,
        url: 'https://www.coursera.org/learn/apis/'
      },
      {
        id: 'c_system',
        title: 'Grokking the Modern System Design Interview',
        platform: 'Educative',
        level: 'Beginner-Intermediate',
        duration: '4 weeks',
        aiMatch: '99%',
        skill: 'System Design',
        priority: 'Critical Priority',
        priorityType: 'critical',
        currentLevel: 45,
        targetLevel: 85,
        status: 'In Progress',
        recommendation: `Recommended because System Design helps build scalable applications for ${targetRole}.`,
        url: 'https://educative.io/gsdmvm'
      },
      {
        id: 'c_docker',
        title: 'Docker and Kubernetes: The Complete Guide',
        platform: 'Udemy',
        level: 'Beginner-Intermediate',
        duration: '3 weeks',
        aiMatch: '99%',
        skill: 'Docker',
        priority: 'Moderate Priority',
        priorityType: 'moderate',
        currentLevel: 45,
        targetLevel: 85,
        status: 'In Progress',
        recommendation: `Recommended because containerization improves deployment and DevOps skills for ${targetRole}.`,
        url: 'https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/'
      },
      {
        id: 'c_testing',
        title: 'Overview of JUnit Testing',
        platform: 'Coursera',
        level: 'Beginner-Intermediate',
        duration: '4 weeks',
        aiMatch: '99%',
        skill: 'Unit Testing',
        priority: 'Moderate Priority',
        priorityType: 'moderate',
        currentLevel: 45,
        targetLevel: 85,
        status: 'In Progress',
        recommendation: `Recommended because unit testing improves software quality and reliability for ${targetRole}.`,
        url: 'https://www.coursera.org/learn/j-unit-testing'
      },
      {
        id: 'c_java',
        title: 'Introduction to Java and Object-Oriented Programming',
        platform: 'Coursera',
        level: 'Beginner',
        duration: '2 weeks',
        aiMatch: '99%',
        skill: 'Java',
        priority: 'Critical Priority',
        priorityType: 'critical',
        currentLevel: 45,
        targetLevel: 85,
        status: 'In Progress',
        recommendation: `Recommended because Java and OOP concepts are essential programming skills for ${targetRole}.`,
        url: 'https://www.coursera.org/learn/java-object-oriented-programming'
      },
      {
        id: 'c_git',
        title: 'Introduction to Git and GitHub',
        platform: 'Coursera',
        level: 'Beginner',
        duration: '2 weeks',
        aiMatch: '99%',
        skill: 'Git and GitHub',
        priority: 'Moderate Priority',
        priorityType: 'moderate',
        currentLevel: 45,
        targetLevel: 85,
        status: 'In Progress',
        recommendation: `Recommended because version control and collaboration are important in software development for ${targetRole}.`,
        url: 'https://www.coursera.org/learn/introduction-git-github/'
      },
      {
        id: 'c_database',
        title: 'Introduction to Databases for Back-End Development',
        platform: 'Coursera',
        level: 'Beginner',
        duration: '3 weeks',
        aiMatch: '99%',
        skill: 'SQL and Database',
        priority: 'Critical Priority',
        priorityType: 'critical',
        currentLevel: 45,
        targetLevel: 85,
        status: 'In Progress',
        recommendation: `Recommended because database management and SQL are essential backend skills for ${targetRole}.`,
        url: 'https://www.coursera.org/learn/intro-to-databases-back-end-development'
      },
      {
        id: 'c_security',
        title: 'Foundations of Cybersecurity',
        platform: 'Coursera',
        level: 'Beginner',
        duration: '1 week',
        aiMatch: '99%',
        skill: 'Cybersecurity',
        priority: 'Moderate Priority',
        priorityType: 'moderate',
        currentLevel: 45,
        targetLevel: 85,
        status: 'In Progress',
        recommendation: `Recommended because understanding application security helps developers build safer software for ${targetRole}.`,
        url: 'https://www.coursera.org/learn/foundations-of-cybersecurity/'
      },
      {
        id: 'c_sdlc',
        title: 'Software Development Lifecycle Specialization',
        platform: 'Coursera',
        level: 'Beginner-Intermediate',
        duration: '4 weeks',
        aiMatch: '99%',
        skill: 'Software Development Lifecycle',
        priority: 'Moderate Priority',
        priorityType: 'moderate',
        currentLevel: 45,
        targetLevel: 85,
        status: 'In Progress',
        recommendation: `Recommended because understanding the software development lifecycle improves project planning and delivery for ${targetRole}.`,
        url: 'https://www.coursera.org/specializations/software-development-lifecycle'
      }
    ];
  });

  const [savingId, setSavingId] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  // Toggle Course Completion and persist to SQLite backend
  const handleToggleStatus = async (courseId) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    if (!targetCourse) return;
    const newStatus = targetCourse.status === 'Completed' ? 'In Progress' : 'Completed';
    const isCompletedNow = newStatus === 'Completed';
    setSavingId(courseId);
    try {
      const res = await API.post('/progress/complete', {
        courseId: targetCourse.id,
        courseTitle: targetCourse.title,
        skill: targetCourse.skill,
        increment: isCompletedNow ? 6 : -6
      });
      const updatedScore = res.data?.newScore || (isCompletedNow ? Math.min(98, matchScore + 6) : Math.max(35, matchScore - 6));
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? {
                ...c,
                status: newStatus,
                currentLevel: isCompletedNow ? c.targetLevel : Math.max(35, c.currentLevel - 20)
              }
            : c
        )
      );
      if (setResumeData && resumeData) {
        const updatedSkills = (resumeData.skills || []).map((sk) => {
          if ((sk.skill || sk.name || '').toLowerCase() === targetCourse.skill.toLowerCase()) {
            return { ...sk, currentLevel: isCompletedNow ? targetCourse.targetLevel : 50 };
          }
          return sk;
        });
        const exists = updatedSkills.some(
          (sk) => (sk.skill || sk.name || '').toLowerCase() === targetCourse.skill.toLowerCase()
        );
        if (!exists && isCompletedNow) {
          updatedSkills.push({
            skill: targetCourse.skill.toUpperCase(),
            name: targetCourse.skill,
            currentLevel: targetCourse.targetLevel,
            requiredLevel: 85,
            category: 'Mastered Skill',
            evidence: 'Verified via Course Completion'
          });
        }
        const newResumeData = {
          ...resumeData,
          matchScore: updatedScore,
          skills: updatedSkills
        };
        setResumeData(newResumeData);
      }
      setSuccessToast(
        isCompletedNow
          ? `✓ Course completed! ATS match score upgraded to ${updatedScore}% (+6%). Recorded in SQLite database.`
          : `Course marked in progress. ATS score adjusted to ${updatedScore}%.`
      );
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Progress sync error:', err);
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? { ...c, status: newStatus }
            : c
        )
      );
    } finally {
      setSavingId(null);
    }
  };

  const completedCount = courses.filter((c) => c.status === 'Completed').length;
  const inProgressCount = courses.filter((c) => c.status === 'In Progress').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setActiveTab('progress')}
            className="text-xs bg-emerald-500 text-slate-950 font-bold px-3 py-1 rounded-lg hover:bg-emerald-400 transition-colors"
          >
            View in Progress Tab →
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
              Skill Acceleration Hub
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            Curated Learning Paths & Skill Verification
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Complete suggested courses to dynamically level up your skills, boost ATS score, and unlock job opportunities.
          </p>
        </div>
        {/* Counter Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/80 text-xs">
            <span className="text-slate-400 block">Completed</span>
            <strong className="text-emerald-400 text-sm font-bold">{completedCount} Courses</strong>
          </div>
          <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/80 text-xs">
            <span className="text-slate-400 block">In Progress</span>
            <strong className="text-amber-400 text-sm font-bold">{inProgressCount} Courses</strong>
          </div>
          <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/80 text-xs">
            <span className="text-slate-400 block">Current ATS</span>
            <strong className="text-cyan-400 text-sm font-bold">{matchScore}%</strong>
          </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses.map((item) => {
          const isDone = item.status === 'Completed';
          const isSaving = savingId === item.id;
          return (
            <div
              key={item.id}
              className={`bg-slate-900/80 border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-lg backdrop-blur-md ${
                isDone ? 'border-emerald-500/40 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-white leading-tight">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {item.platform} • {item.level} • {item.duration}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50 shrink-0">
                    {item.aiMatch} AI Match
                  </span>
                </div>
                {/* Status & Priority Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 border ${
                      isDone
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{item.status}</span>
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                    Skill: {item.skill}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                      item.priorityType === 'critical'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
                {/* Current vs Target Proficiency Indicator */}
                <div className="flex items-center gap-2 text-xs font-medium pt-1">
                  <span className="text-slate-400">
                    Current: <strong className={isDone ? 'text-emerald-400' : 'text-cyan-400'}>{item.currentLevel}%</strong>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-400">
                    Target: <strong className="text-slate-200">{item.targetLevel}%</strong>
                  </span>
                  {isDone && (
                    <span className="ml-auto text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      +6% Score Boost Applied
                    </span>
                  )}
                </div>
                {/* Recommendation Note */}
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  {item.recommendation}
                </p>
              </div>
              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Compass className="w-4 h-4" />
                  <span>Start Learning</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                {/* Complete Course Toggle */}
                <button
                  disabled={isSaving}
                  onClick={() => handleToggleStatus(item.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                  }`}
                >
                  {isSaving ? (
                    <span>Syncing...</span>
                  ) : isDone ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Completed (Undo)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Complete (+6%)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPathPage;