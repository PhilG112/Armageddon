using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Domain;
using Domain.Models;
using Geocoding;
using Geocoding.Google;
using Newtonsoft.Json;

namespace HookIn
{
    public class Program
    {
        static void Main(string[] args)
        {
            //ParseCsv();
            ReverseGeocode();

            Console.ReadKey();
        }

        public static void ParseCsv()
        {
            var db = new ArmageddonContext("Data Source=xpswindows\\development;Initial Catalog=ArmageddonDB;Integrated Security=True;MultipleActiveResultSets=True");
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

        public static void ReverseGeocode()
        {
            using (var db = new ArmageddonContext("Data Source=xpswindows\\development;Initial Catalog=ArmageddonDB;Integrated Security=True;MultipleActiveResultSets=True"))
            {
                var m = db.Meteorites.ToList();
                GoogleGeocoder geocoder = new GoogleGeocoder();
                var counter = 1;
                foreach (var c in m)
                {
                    if (string.IsNullOrEmpty(c.Longitude) || string.IsNullOrEmpty(c.Latitude)) continue;
                    if (!string.IsNullOrEmpty(c.Country)) continue;
                    if (c.Longitude == c.Latitude) continue;

                    var addresses = geocoder.ReverseGeocode(double.Parse(c.Latitude), double.Parse(c.Longitude));
                    if (!addresses.Any()) continue;
                    var country = addresses.Where(a => !a.IsPartialMatch).Select(a => a[GoogleAddressType.Country])
                        .First();

                    c.Country = country.LongName;
                    db.SaveChanges();
                    Console.WriteLine(counter);
                    counter++;
                }
                
                Console.WriteLine("Done All");
            }
        }
    }
}
