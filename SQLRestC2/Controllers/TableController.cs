using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SqlServer.Management.Common;
using Microsoft.SqlServer.Management.Smo;

namespace SQLRestC2.Controllers
{
    [Authorize]
    [ApiController]
    [Route(Global.ROOT+"{database}/{schema}/table")]
    public class TableController : ControllerBase
    {
        //list all Table info
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
                    var db = server.Databases[database];
                    response.success = (db != null);
                    if (response.success)
                    {
                        response.success = db.Schemas.Contains(schema);
                        if (response.success)
                        {
                            response.result = Global.getTableInfo(db, schema, detail);
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

        //get Table info by name
        [HttpGet("{name}")]
        public ResponseJson Get(String database, String schema, String name,bool detail = false)
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
                        response.success = db.Schemas.Contains(schema);
                        if (response.success)
                        {
                            var obj = db.Tables[name, schema];
                            response.success = (obj != null);
                            if (response.success)
                            {
                                response.result = new TableJson
                                {
                                    id = obj.ID,
                                    name = obj.Name,
                                    created = obj.CreateDate,
                                    dataUsage = obj.DataSpaceUsed,
                                    indexUsage = obj.IndexSpaceUsed,
                                    columns = (detail ? Global.getColumnInfo(obj.Columns) : null),
                                    path = obj.ExtendedProperties.Contains(Global.MS_PATH) ? (String)obj.ExtendedProperties[Global.MS_PATH].Value : null,
                                    alias = obj.ExtendedProperties.Contains(Global.MS_ALIAS) ? (String)obj.ExtendedProperties[Global.MS_ALIAS].Value : null
                                };
                            }
                            else response.result = "Table '" + database + "." + schema + "." + name + "' not found!";
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

        //create Table
        [HttpPost("{name}")]
        public ResponseJson Create(String database,String schema, String name, List<ColumnJson> columns, String? alias, String? path)
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
                        response.success = !db.Tables.Contains(name, schema);
                        if (response.success)
                        {
                            var obj = new Table(db, name, schema);
                            foreach (var col in columns)
                            {
                                obj.Columns.Add(Global.makeColumn(col, obj));
                            }
                            obj.Create();
                            if (!String.IsNullOrEmpty(path)) (new ExtendedProperty(obj, Global.MS_PATH, path)).Create();
                            if (!String.IsNullOrEmpty(alias)) (new ExtendedProperty(obj, Global.MS_ALIAS, alias)).Create();
                            var i = 0;
                            foreach (Column col in obj.Columns)
                            {
                                var ali = columns[i++].alias;
                                if (!String.IsNullOrEmpty(ali)) (new ExtendedProperty(col, Global.MS_ALIAS, ali)).Create();
                            }
                            response.result = obj.ID;
                        }
                        else response.result = "Table '" + database + "." + schema + "." + name + "' already exists!";
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

        //rename Table
        [HttpPut("{name}")]
        public ResponseJson Rename(String database, String schema, String name, String newName, String? newAlias, String? newPath)
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
                        var obj = db.Tables[name, schema];
                        response.success = (obj != null);
                        if (response.success)
                        {
                            if (!name.Equals(newName)) obj.Rename(newName);
                            if (!String.IsNullOrEmpty(newPath))
                            {
                                var prop = obj.ExtendedProperties.Contains(Global.MS_PATH) ? obj.ExtendedProperties[Global.MS_PATH] : new ExtendedProperty(obj, Global.MS_PATH);
                                prop.Value = newPath;
                                prop.CreateOrAlter();
                            }
                            if (!String.IsNullOrEmpty(newAlias))
                            {
                                var prop = obj.ExtendedProperties.Contains(Global.MS_ALIAS) ? obj.ExtendedProperties[Global.MS_ALIAS] : new ExtendedProperty(obj, Global.MS_ALIAS);
                                prop.Value = newAlias;
                                prop.CreateOrAlter();
                            }
                        }
                        else response.result = "Table '" + database + "." + schema + "." + name + "' not found!";
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

        //drop Table
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
                        var obj = db.Tables[name, schema];
                        response.success = (obj != null);
                        if (response.success)
                        {
                            obj.Drop();
                        }
                        else response.result = "Table '" + database + "." + schema + "." + name + "' not found!";
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
