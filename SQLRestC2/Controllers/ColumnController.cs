using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SqlServer.Management.Common;
using Microsoft.SqlServer.Management.Smo;

namespace SQLRestC2.Controllers
{
    [Authorize]
    [ApiController]
    [Route(Global.ROOT+ "{database}/{schema}/column/{table}")]
    public class ColumnController : ControllerBase
    {
        //list all Table info
        [HttpGet]
        public ResponseJson GetAll(String database, String schema, String table)
        {
            Server server = null;
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success = user.issystem};
                if (response.success)
                {
                    server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                    var db = server.Databases[database];
                    response.success = (db != null);
                    if (response.success){
                        var tb = db.Tables[(String)table, schema];
                        View vw = null;
                        if (tb == null) vw = db.Views[table, schema];
                        response.success = (tb != null || vw != null);
                        if (response.success)
                        {
                            response.result = Global.getColumnInfo(tb != null ? tb.Columns : vw.Columns);
                        }
                        else response.result = "Table/View '" + database + "." + schema + "." + table + "' not found!";
                   
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
        public ResponseJson Get(String database, String schema, String table, String name)
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
                        var tb = db.Tables[(String)table, schema];
                        View vw = null;
                        if (tb == null) vw = db.Views[table, schema];
                        response.success = (tb != null || vw != null);
                        if (response.success)
                        {
                            var obj = (tb != null ? tb.Columns[name] : vw.Columns[name]);
                            response.success = (obj != null);
                            if (response.success)
                            {
                                response.result = new ColumnJson
                                {
                                    id = obj.ID,
                                    name = obj.Name,
                                    dataType = obj.DataType.Name,
                                    length = (obj.DataType.IsNumericType ? obj.DataType.NumericScale : obj.DataType.MaximumLength),
                                    precision = obj.DataType.NumericPrecision,
                                    nullable = obj.Nullable,
                                    inPrimaryKey = obj.InPrimaryKey,
                                    identity = obj.Identity,
                                    defaultValue = obj.Default,
                                    alias = obj.ExtendedProperties.Contains(Global.MS_ALIAS) ? (String)obj.ExtendedProperties[Global.MS_ALIAS].Value : null
                                };
                            }
                            else response.result = "Column '" + database + "." + schema + "." + table + "." + name + "' not found!";
                        }
                        else response.result = "Table/View '" + database + "." + schema + "." + table + "' not found!";
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

        //alter table's Columns by column name (~)
        //add new if column name not exists (+)
        //delete if data type = null (-)
        [HttpPost]
        public ResponseJson Add(String database, String schema, String table, ColumnJson column)
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
                        var tb = db.Tables[table, schema];
                        response.success = (tb != null);
                        if (response.success)
                        {
                            var col = Global.makeColumn(column, tb);
                            response.result = col.ID;
                        }
                        else response.result = "Table '" + database + "." + schema + "." + table + "' not found!";
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

        //alter table's Columns by column name (~)
        //add new if column name not exists (+)
        //delete if data type = null (-)
        [HttpPost("alter")]
        public ResponseJson Alter(String database, String schema, String table, List<ColumnJson> columns)
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
                        var tb = db.Tables[table, schema];
                        response.success = (tb != null);
                        if (response.success)
                        {
                            var counts = new int[] { 0, 0, 0 };//add, edit, delete
                            for (int i = 0; i < columns.Count; i++)
                            {
                                var col = columns[i];
                                var column = tb.Columns.ItemById(col.id);
                                if (column == null)
                                { //add new
                                    column = Global.makeColumn(col, tb);
                                    counts[0]++;
                                }
                                else
                                {
                                    if (col.dataType == "DELETE")
                                    {
                                        tb.Columns.Remove(column);
                                        counts[2]++;
                                    }
                                    else//modify
                                    {
                                        Global.makeColumn(col, column);
                                        counts[1]++;
                                    }
                                }
                            }
                            tb.Alter();
                            response.result = counts;
                        }
                        else response.result = "Table '" + database + "." + schema + "." + table + "' not found!";
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

        //edit column
        [HttpPut]
        public ResponseJson Edit(String database, String schema, String table,ColumnJson column)
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
                        var tb = db.Tables[table, schema];
                        response.success = (tb != null);
                        if (response.success)
                        {
                            var obj = tb.Columns.ItemById(column.id);
                            response.success = (obj != null);
                            if (response.success)
                            {
                                var col = Global.makeColumn(column, obj);
                                col.Alter();
                            }
                            else response.result = "Column '" + database + "." + schema + "." + table + "." + column.name + "' not found!";
                        }
                        else response.result = "Table '" + database + "." + schema + "." + table + "' not found!";
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

        //delete Column
        [HttpDelete("{name}")]
        public ResponseJson Drop(String database, String schema, String table, String name)
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
                        var tb = db.Tables[table, schema];
                        response.success = (tb != null);
                        if (response.success)
                        {
                            int id = -1;
                            var obj = int.TryParse(name, out id) ? tb.Columns.ItemById(id) : tb.Columns[name];
                            response.success = (obj != null);
                            if (response.success)
                            {
                                obj.Drop();
                            }
                            else response.result = "Column '" + database + "." + schema + "." + table + "." + name + "' not found!";
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
