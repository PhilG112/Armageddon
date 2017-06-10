using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    public class Meteorite
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string NameType { get; set; }
        public string RecClass { get; set; }
        public string Mass { get; set; }
        public string Year { get; set; }
        public string Latitude { get; set; }
        public string Longitude { get; set; }
        public string Country { get; set; }
    }
}
