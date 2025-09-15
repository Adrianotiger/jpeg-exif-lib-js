class JPGTaga005 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "ExifInteroperabilityOffset (" + name + ")", bigEndian);
		
		this.TagType = "number";
	}
};