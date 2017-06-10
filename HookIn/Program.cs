using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain;
using Domain.Models;
using Microsoft.VisualBasic.FileIO;
using Newtonsoft.Json.Linq;

namespace HookIn
{
    public class Program
    {
        static void Main(string[] args)
        {
            //var db = new ArmageddonContext();
            //db.Database.ExecuteSqlCommand("delete from dbo.Meteorites");
            ParseCsv();
            Console.ReadKey();
        }

        public static void ParseCsv()
        {
            var db = new ArmageddonContext();
            var data = File.ReadAllLines("Meteorite_Landings.csv")
                .Skip(1)
                .Select(x => x.Split(','))
                .Select(x => new Meteorite
                {
                    Name = x[0],
                    NameType = x[2],
                    RecClass = x[3],
                    Mass = x[4],
                    Year = x[6],
                    Longitude = x[8],
                    Latitude = x[7]
                });
            var counter = 1;
            foreach (var d in data )
            {
                db.Meteorites.Add(d);
                Console.WriteLine(counter);
                counter++;
            }
            db.SaveChanges();
            Console.WriteLine("Done");
        }

    }
}
