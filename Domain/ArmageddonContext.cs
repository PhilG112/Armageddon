using System.Data.Entity;
using Domain.Models;

namespace Domain
{
    public class ArmageddonContext : DbContext
    {
        public ArmageddonContext() : base("connString") { }

        public DbSet<Meteorite> Meteorites { get; set; }
    }
}
