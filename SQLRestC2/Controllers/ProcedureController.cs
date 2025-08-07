using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SqlServer.Management.Common;
using Microsoft.SqlServer.Management.Smo;

namespace SQLRestC2.Controllers
{
    [Authorize]
    [ApiController]
    [Route(Global.ROOT + "{database}/{schema}/procedure")]
    public class ProcedureController : ControllerBase
    {
        //list all Procedure info
        [HttpGet]
        public ResponseJson GetAll(String database, String schema, bool detail = false)
        {
            Server server = null;
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success = user.issystem };
                if (response.success)
                {
                    server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                    var db = server.Databases[(String)database];
                    response.success = (db != null);
                    if (response.success)
                    {
                        response.success = db.Schemas.Contains(schema);
                        if (response.success)
                        {
                            response.result = Global.getProcedureInfo(db, schema, detail);
                        }
                        else response.result = "Schema '" + database + "." + schema + "' not found!";
                    }
                    else response.result = "Database '" + database + "' not found!";

                }
                else response.result = "User is not System User!";
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseJson { success = false, result = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message) };
            }
            finally
            {
                if (server != null) server.ConnectionContext.Disconnect();
            }

        }

        //get Procedure info by name
        [HttpGet("{name}")]
        public ResponseJson Get(String database, String schema, String name, bool detail = false)
        {
            Server server = null;
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success = user.issystem };
                if (response.success)
                {
                    server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                    var db = server.Databases[(String)database];
                    response.success = (db != null);
                    if (response.success)
                    {
                        response.success = db.Schemas.Contains(schema);
                        if (response.success)
                        {
                            var obj = db.StoredProcedures[name, schema];
                            response.success = (obj != null);
                            if (response.success)
                            {
                                response.result = new ProcedureJson
                                {
                                    id = obj.ID,
                                    name = obj.Name,
                                    created = obj.CreateDate,
                                    textHeader = obj.TextHeader,
                                    textBody = obj.TextBody,
                                    parameters = (detail ? Global.getParameterInfo(obj.Parameters) : null),
                                    path = obj.ExtendedProperties.Contains(Global.MS_PATH) ? (String)obj.ExtendedProperties[Global.MS_PATH].Value : null,
                                    alias = obj.ExtendedProperties.Contains(Global.MS_ALIAS) ? (String)obj.ExtendedProperties[Global.MS_ALIAS].Value : null
                                };
                            }
                            else response.result = "Procedure '" + database + "." + schema + "." + name + "' not found!";
                        }
                        else response.result = "Schema '" + database + "." + name + "' not found!";
                    }
                    else response.result = "Database '" + database + "' not found!";
                }
                else response.result = "User is not System User!";
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseJson { success = false, result = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message) };
            }
            finally
            {
                if (server != null) server.ConnectionContext.Disconnect();
            }

        }

        //execute Procedure
        [HttpPost("{name}/{param}")]
        public ResponseJson Execute(String database, String schema, String name, String? param)
        {
            Server server = null;
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success = user.issystem };
                if (response.success)
                {
                    server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                    var db = server.Databases[database];
                    response.success = (db != null);
                    if (response.success)
                    {
                        var obj = db.StoredProcedures[name, schema];
                        response.success = (obj != null);
                        if (response.success)
                        {
                            var sql = "Exec " + obj.Name + " " + param;
                            response.success = Global.safeSqlInjection(sql);
                            if (response.success)
                            {
                                using (var ds = db.ExecuteWithResults(sql))
                                {
                                    response.result = Global.dtable2array(ds.Tables[0]);
                                }
                            }
                            else response.result = "SQL INJECTION FOUND! Not safe to executes.";
                        }
                        else response.result = "Procedure '" + database + "." + schema + "." + name + "' not found!";
                    }
                    else response.result = "Database '" + database + "' not found!";
                }
                else response.result = "User is not System User!";
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseJson { success = false, result = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message) };
            }
            finally
            {
                if (server != null) server.ConnectionContext.Disconnect();
            }
        }
        //create Procedure
        [HttpPost("{name}")]
        public ResponseJson Create(String database, String schema, String name, String parameter, ScriptJson sql, String? path)
        {
            Server server = null;
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success = user.issystem };
                if (response.success)
                {
                    server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                    var db = server.Databases[database];
                    response.success = (db != null);
                    if (response.success)
                    {
                        response.success = !db.StoredProcedures.Contains(name, schema);
                        if (response.success)
                        {
                            var obj = new StoredProcedure(db, name, schema);
                            obj.TextHeader = "CREATE PROCEDURE " + schema + "." + name + " " + sql.parameter + " AS ";
                            obj.TextBody = sql.body;
                            obj.Create();
                            if (!String.IsNullOrEmpty(path))
                            {
                                obj.ExtendedProperties.Add(new ExtendedProperty(obj, Global.MS_PATH, path));
                            }
                            response.result = obj.ID;
                        }
                        else response.result = "Procedure '" + database + "." + schema + "." + name + "' already exists!";
                    }
                    else response.result = "Database '" + database + "' not found!";
                }
                else response.result = "User is not System User!";
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseJson { success = false, result = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message) };
            }
            finally
            {
                if (server != null) server.ConnectionContext.Disconnect();
            }
        }
        //edit Procedure
        [HttpPost("{name}/edit")]
        public ResponseJson Edit(String database, String schema, String name, ScriptJson sql)
        {
            Server server = null;
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success = user.issystem };
                if (response.success)
                {
                    server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                    var db = server.Databases[database];
                    response.success = (db != null);
                    if (response.success)
                    {
                        var obj = db.StoredProcedures[name, schema];
                        response.success = (obj != null);
                        if (response.success)
                        {
                            obj.TextHeader = "CREATE PROCEDURE " + schema + "." + name + " " + sql.parameter + " AS ";
                            obj.TextBody = sql.body;
                            obj.Alter();
                        }
                        else response.result = "View '" + database + "." + schema + "." + name + "' not found!";
                    }
                    else response.result = "Database '" + database + "' not found!";
                }
                else response.result = "User is not System User!";
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseJson { success = false, result = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message) };
            }
            finally
            {
                if (server != null) server.ConnectionContext.Disconnect();
            }
        }
        //rename Procedure
        [HttpPut("{name}")]
        public ResponseJson Rename(String database, String schema, String name, String newName, String? newPath)
        {
            Server server = null;
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success = user.issystem };
                if (response.success)
                {
                    server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                    var db = server.Databases[database];
                    response.success = (db != null);
                    if (response.success)
                    {
                        var obj = db.StoredProcedures[name, schema];
                        response.success = (obj != null);
                        if (response.success)
                        {
                            obj.Rename(newName);
                            if (!String.IsNullOrEmpty(newPath))
                            {
                                var prop = obj.ExtendedProperties[Global.MS_PATH];
                                if (prop == null)
                                    obj.ExtendedProperties.Add(new ExtendedProperty(obj, Global.MS_PATH, newPath));
                                else
                                    prop.Value = newPath;
                            }
                        }
                        else response.result = "Procedure '" + database + "." + schema + "." + name + "' not found!";
                    }
                    else response.result = "Database '" + database + "' not found!";
                }
                else response.result = "User is not System User!";
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseJson { success = false, result = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message) };
            }
            finally
            {
                if (server != null) server.ConnectionContext.Disconnect();
            }
        }

        //drop Procedure
        [HttpDelete("{name}")]
        public ResponseJson Drop(String database, String schema, String name)
        {
            Server server = null;
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success = user.issystem };
                if (response.success)
                {
                    server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                    var db = server.Databases[database];
                    response.success = (db != null);
                    if (response.success)
                    {
                        var obj = db.StoredProcedures[name, schema];
                        response.success = (obj != null);
                        if (response.success)
                        {
                            obj.Drop();
                        }
                        else response.result = "Procedure '" + database + "." + schema + "." + name + "' not found!";
                    }
                    else response.result = "Database '" + database + "' not found!";
                }
                else response.result = "User is not System User!";
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseJson { success = false, result = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message) };
            }
            finally
            {
                if (server != null) server.ConnectionContext.Disconnect();
            }
        }
    }
}
