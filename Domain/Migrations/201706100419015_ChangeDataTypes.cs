namespace Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ChangeDataTypes : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Meteorites", "Mass", c => c.String());
            AlterColumn("dbo.Meteorites", "Latitude", c => c.String());
            AlterColumn("dbo.Meteorites", "Longitude", c => c.String());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Meteorites", "Longitude", c => c.Decimal(nullable: false, precision: 18, scale: 2));
            AlterColumn("dbo.Meteorites", "Latitude", c => c.Decimal(nullable: false, precision: 18, scale: 2));
            AlterColumn("dbo.Meteorites", "Mass", c => c.Decimal(nullable: false, precision: 18, scale: 2));
        }
    }
}
