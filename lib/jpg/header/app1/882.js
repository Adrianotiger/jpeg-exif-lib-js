class JPGTag882 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "SubjectLocation (" + name + ")", bigEndian);
		
		this.TagType = "number";
	}
};