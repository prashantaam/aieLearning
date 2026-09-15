import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [teacher, setTeacher] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [authType, setAuthType] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Restore authentication when the app loads
  |--------------------------------------------------------------------------
  */

  const checkAuthStatus = () => {
    try {
      const token =
        localStorage.getItem("token");

      const studentStr =
        localStorage.getItem("student");

      const teacherStr =
        localStorage.getItem("teacher");

      /*
      |--------------------------------------------------------------------------
      | Student authentication
      |--------------------------------------------------------------------------
      */

      if (token && studentStr) {
        const studentData =
          JSON.parse(studentStr);

        setStudent(studentData);
        setTeacher(null);

        setAuthType("student");
        setIsAuthenticated(true);

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Teacher authentication
      |--------------------------------------------------------------------------
      */

      if (token && teacherStr) {
        const teacherData =
          JSON.parse(teacherStr);

        setTeacher(teacherData);
        setStudent(null);

        setAuthType("teacher");
        setIsAuthenticated(true);

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | No valid authentication found
      |--------------------------------------------------------------------------
      */

      setStudent(null);
      setTeacher(null);

      setAuthType(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error(
        "Auth check failed:",
        error
      );

      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Student login
  |--------------------------------------------------------------------------
  */

  const loginStudent = (
    studentData,
    token
  ) => {
    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "student",
      JSON.stringify(studentData)
    );

    /*
    |--------------------------------------------------------------------------
    | Remove Teacher session
    |--------------------------------------------------------------------------
    */

    localStorage.removeItem(
      "teacher"
    );

    localStorage.removeItem(
      "user"
    );

    setStudent(studentData);
    setTeacher(null);

    setAuthType("student");
    setIsAuthenticated(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Teacher login
  |--------------------------------------------------------------------------
  */

  const loginTeacher = (
    teacherData,
    token
  ) => {
    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "teacher",
      JSON.stringify(teacherData)
    );

    /*
    |--------------------------------------------------------------------------
    | Remove Student session
    |--------------------------------------------------------------------------
    */

    localStorage.removeItem(
      "student"
    );

    localStorage.removeItem(
      "user"
    );

    setTeacher(teacherData);
    setStudent(null);

    setAuthType("teacher");
    setIsAuthenticated(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Clear authentication
  |--------------------------------------------------------------------------
  */

  const clearAuth = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "student"
    );

    localStorage.removeItem(
      "teacher"
    );

    localStorage.removeItem(
      "user"
    );

    setStudent(null);
    setTeacher(null);

    setAuthType(null);
    setIsAuthenticated(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const logout = () => {
    clearAuth();

    window.location.href = "/";
  };

  /*
  |--------------------------------------------------------------------------
  | Update Student
  |--------------------------------------------------------------------------
  */

  const updateStudent = (
    updatedStudentData
  ) => {
    if (!student) {
      return;
    }

    const newStudentData = {
      ...student,
      ...updatedStudentData,
    };

    localStorage.setItem(
      "student",
      JSON.stringify(
        newStudentData
      )
    );

    setStudent(newStudentData);
  };

  /*
  |--------------------------------------------------------------------------
  | Update Teacher
  |--------------------------------------------------------------------------
  */

  const updateTeacher = (
    updatedTeacherData
  ) => {
    if (!teacher) {
      return;
    }

    const newTeacherData = {
      ...teacher,
      ...updatedTeacherData,
    };

    localStorage.setItem(
      "teacher",
      JSON.stringify(
        newTeacherData
      )
    );

    setTeacher(newTeacherData);
  };

  /*
  |--------------------------------------------------------------------------
  | Convenience values
  |--------------------------------------------------------------------------
  */

  const isStudent =
    authType === "student";

  const isTeacher =
    authType === "teacher";

  const currentUser =
    student || teacher;

  const value = {
    student,
    teacher,

    currentUser,

    loading,

    isAuthenticated,
    isStudent,
    isTeacher,

    authType,

    loginStudent,
    loginTeacher,

    logout,
    clearAuth,

    updateStudent,
    updateTeacher,

    checkAuthStatus,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};
