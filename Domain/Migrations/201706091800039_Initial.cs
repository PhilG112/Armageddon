namespace Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Initial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Meteorites",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        NameType = c.String(),
                        RecClass = c.String(),
                        Mass = c.Decimal(nullable: true, precision: 18, scale: 2),
                        Year = c.DateTime(nullable: true),
                        Latitude = c.Decimal(nullable: true, precision: 18, scale: 2),
                        Longitude = c.Decimal(nullable: true, precision: 18, scale: 2),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.Meteorites");
        }
    }
}
