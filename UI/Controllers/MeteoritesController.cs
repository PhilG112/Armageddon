using System;
using System.Linq;
using System.Web.Script.Serialization;
using Domain;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using PagedList;

namespace UI.Controllers
{
    public class MeteoritesController : Controller
    {
        private readonly ArmageddonContext _context;

        public MeteoritesController(ArmageddonContext context)
        {
            _context = context;
        }

        // GET: /api/meteorites
        [Route("api/meteorites")]
        [HttpGet]
        public IActionResult GetAll(int pageNumber, int pageSize)
        {
            var meteories = _context.Meteorites.OrderBy(x => x.Id).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
            var js = new JavaScriptSerializer {MaxJsonLength = Int32.MaxValue};
            return new ObjectResult(js.Serialize(meteories));
        }
    }
}
