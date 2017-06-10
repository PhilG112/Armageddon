using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Models;

namespace Domain
{
    public class ArmageddonContext : DbContext
    {
        public ArmageddonContext() : base("connString") { }

        public DbSet<Meteorite> Meteorites { get; set; }
    }
}
