using System.Data.Entity;
using Domain.Models;

namespace Domain
{
    public class ArmageddonContext : DbContext
    {
        public ArmageddonContext() { }
        public ArmageddonContext(string connString) : base(connString) { }

        public DbSet<Meteorite> Meteorites { get; set; }
    }
}
