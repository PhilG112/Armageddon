using System;
using System.Linq;
using System.Web.Script.Serialization;
using Domain;
using Microsoft.AspNetCore.Mvc;

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
            var meteories = _context.Meteorites
                .Where(c => c.Country != null)
                .OrderBy(x => x.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize).ToList();

            var serializer = new JavaScriptSerializer {MaxJsonLength = Int32.MaxValue};
            return new ObjectResult(serializer.Serialize(meteories));
        }
    }
}
