const mysql = require("mysql");

let instance = null;

//setup for connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "task_manager",
  port: "3306",
});

//connect to database
connection.connect((err) => {
  if (err) {
    console.log(err.message);
  }
  console.log("Database " + connection.state);
});

//Database Manager Class
class DatabaseManager {
  //get instance of the database manager
  static getDatabaseManagerInstance() {
    if (!instance) {
      instance = new DatabaseManager();
    }
    return instance;
  }

  //add user
  registerUser(email, firstname, lastname, password, role) {
    try {
      const response = new Promise((resolve, reject) => {
        const query =
          "INSERT INTO `users`(`email`, `firstname`, `lastname`, `pass`,`role`) VALUES (?,?,?,?,?)";

        connection.query(
          query,
          [email, firstname, lastname, password, role],
          (err, result) => {
            if (err) {
              reject(new Error(err.message));
            } else {
              resolve(result);
            }
          }
        );
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }
  //get user information
  getUser(email) {
    try {
      const response = new Promise((resolve, reject) => {
        const query = "SELECT * FROM `users` WHERE email = ?";
        connection.query(query, [email], (err, result) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(result);
          }
        });
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }
  //change password request
  updatePassword(email, newPassword) {
    try {
      const response = new Promise((resolve, reject) => {
        const query = "UPDATE `users` SET `pass`=? WHERE email=?";
        connection.query(query, [newPassword, email], (err, result) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(result);
          }
        });
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }
  //getAllEmployees
  getAllEmployees() {
    try {
      const response = new Promise((resolve, reject) => {
        const query =
          "SELECT users.id,users.email, users.firstname,users.lastname,roles.title FROM `users` join roles on users.role = roles.id ORDER BY role";
        connection.query(query, [], (err, result) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(result);
          }
        });
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }
  //Adding projects only for admins
  addProject(title, description, admin) {
    try {
      const response = new Promise((resolve, reject) => {
        const query =
          "INSERT INTO `Projects`(`title`, `description`, `admin`) VALUES (?,?,?)";
        connection.query(query, [title, description, admin], (err, result) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(result);
          }
        });
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }
  //get all projects with all tasks
  getAllProjectsWithTasks() {
    try {
      const response = new Promise((resolve, reject) => {
        const query =
          "Select A.id as p_id,A.title,A.description as p_desc,C.email as admin,b.id as t_id,b.task_title,b.created_on,b.status,b.due_by,b.task_type, b.description as t_desc,d.email as employee from projects A left join tasks B on A.id = b.project left join users C ON A.admin=c.id left join users D on b.assigned_to=d.id ORDER by a.id ,b.id";
        connection.query(query, [], (err, result) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(result);
          }
        });
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }
  //get all projects and their tasks for a manager
  getAllProjectsWithTasksForManager(email) {
    try {
      const response = new Promise((resolve, reject) => {
        const query =
          "Select A.id as p_id,A.title,A.description as p_desc,C.email as admin,b.id as t_id,b.task_title,b.created_on,b.status,b.due_by,b.task_type, b.description as t_desc,d.email as employee from projects A left join tasks B on A.id = b.project left join users C ON A.admin=c.id left join users D on b.assigned_to=d.id where c.email=? ORDER by a.id ,b.id";
        connection.query(query, [email], (err, result) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(result);
          }
        });
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }
  //get all projects and their tasks for an employee
  getAllProjectsWithTasksForEmployee(email) {
    try {
      const response = new Promise((resolve, reject) => {
        const query =
          "Select A.id as p_id,A.title,A.description as p_desc,C.email as admin,b.id as t_id,b.task_title,b.created_on,b.status,b.due_by,b.task_type, b.description as t_desc,d.email as employee from projects A join tasks B on A.id = b.project join users C ON A.admin=c.id join users D on b.assigned_to=d.id where d.email=? ORDER by a.id ,b.id";
        connection.query(query, [email], (err, result) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(result);
          }
        });
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }

  //delete project only for admins
  deleteProject(id) {
    try {
      const response = new Promise((resolve, reject) => {
        const query = "DELETE FROM `projects` WHERE projects.id=?";
        connection.query(query, [id], (err, result) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(result);
          }
        });
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }
  //Add tasks for a project
  addTaskForProject(
    task_title,
    project,
    created_on,
    due_by,
    task_type,
    description,
    assigned_to
  ) {
    try {
      const response = new Promise((resolve, reject) => {
        const query =
          "INSERT INTO `tasks`(`task_title`, `project`, `created_on`, `due_by`, `task_type`, `description`, `assigned_to`) VALUES (?,?,?,?,?,?,?)";
        connection.query(
          query,
          [
            task_title,
            project,
            created_on,
            due_by,
            task_type,
            description,
            assigned_to,
          ],
          (err, result) => {
            if (err) {
              reject(new Error(err.message));
            } else {
              resolve(result);
            }
          }
        );
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }
  //Delete a task for a project
  deleteTask(id) {
    try {
      const response = new Promise((resolve, reject) => {
        const query = "DELETE FROM `tasks` WHERE id=?";
        connection.query(query, [id], (err, result) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(result);
          }
        });
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }
  //get task comments
  getTaskComments(id) {
    try {
      const response = new Promise((resolve, reject) => {
        const query =
          "SELECT C.id, comment_text, created_on,A.email as comment_by FROM `task_comments` C left join users A on C.comment_by=A.id where C.task=?";
        connection.query(query, [id], (err, result) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(result);
          }
        });
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }
  //adding a comment for a task by an employee or manager
  addTaskComment(task, project, comment_text, created_on, comment_by) {
    try {
      const response = new Promise((resolve, reject) => {
        const query =
          "INSERT INTO `task_comments`(`task`,`project`, `comment_text`, `created_on`, `comment_by`) VALUES (?,?,?,?,?)";
        connection.query(
          query,
          [task, project, comment_text, created_on, comment_by],
          (err, result) => {
            if (err) {
              reject(new Error(err.message));
            } else {
              resolve(result);
            }
          }
        );
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }
  //Changing task status
  editTaskStatus(id, status) {
    try {
      const response = new Promise((resolve, reject) => {
        const query = "UPDATE `tasks` SET `status`=? WHERE id=?";
        connection.query(query, [status, id], (err, result) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(result);
          }
        });
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }
}
module.exports = DatabaseManager;
