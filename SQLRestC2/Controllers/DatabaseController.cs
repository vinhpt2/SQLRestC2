using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SqlServer.Management.Common;
using Microsoft.SqlServer.Management.Smo;

namespace SQLRestC2.Controllers
{
    [Authorize]
    [ApiController]
    [Route(Global.ROOT+"database")]
    public class DatabaseController : ControllerBase
    {
        //list all databases info
        [HttpGet]
        public ResponseJson GetAll(bool isDetail = false, bool isSystem=false)
        {
            Server server = null;
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success = user.issystem };
                if (response.success)
                {
                    server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                    response.result = Global.getDatabaseInfo(server, isDetail, isSystem);
                }
                else response.result = "User is not System User!";
                return response;

            } catch (Exception ex)
            {
                return new ResponseJson { success = false, result = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message) };
            }
            finally
            {
                if (server != null) server.ConnectionContext.Disconnect();
            }

        }

        //get database info by name
        [HttpGet("{name}")]
        public ResponseJson Get(String name, bool isDetail = false)
        {
            Server server = null;
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success = user.issystem };
                if (response.success)
                {
                    server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                    var obj = server.Databases[name];
                    response.success = (obj != null);
                    if (response.success)
                    {
                        response.result = new DatabaseJson
                        {
                            id = obj.ID,
                            name = obj.Name,
                            created = obj.CreateDate,
                            dataUsage = obj.DataSpaceUsage,
                            indexUsage = obj.IndexSpaceUsage,
                            schemas = isDetail ? Global.getSchemaInfo(obj, obj.IsSystemObject) : null
                        };
                    }
                    else response.result = "Database '" + name + "' not found!";
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
        
        //create database
        [HttpPost("{name}")]
        public ResponseJson Create(String name)
        {
            Server server = null;
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success = user.issystem };
                if (response.success)
                {
                    server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                    response.success = !server.Databases.Contains(name);
                    if (response.success)
                    {
                        var obj = new Database(server, name);
                        obj.Create();
                        response.result = obj.Name;
                    }
                    else response.result = "Database '" + name + "' already exists!";
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

        //rename database
        [HttpPut("{name}")]
        public ResponseJson Rename(String name,String newName)
        {
            Server server = null;
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success = user.issystem };
                if (response.success)
                {
                    server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                    var obj = server.Databases[name];
                    response.success = (obj != null);
                    if (response.success)
                    {
                        obj.Rename(newName);
                    }
                    else response.result = "Database '" + name + "' not exists!";
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

        //drop database
        [HttpDelete("{name}")]
        public ResponseJson Drop(String name)
        {
            Server server = null;
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success = user.issystem };
                if (response.success)
                {
                    server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                    var obj = server.Databases[name];
                    response.success = (obj != null);
                    if (response.success)
                    {
                        obj.Drop();
                    }
                    else response.result = "Database '" + name + "' not exists!";
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
