class JPGTag2 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "InteropVersion (" + name + ")", bigEndian);
		
		this.TagType = "string";
	}
};

{

const tagIndex = JPGCONST.EXIF.INTEROP_VERSION;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Interoperability Version", 
		defaults:{tag:tagIndex, type:7, length:3, value:0x312e3000},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "InteropVersion (" + name + ")", bigEndian, tagIndex);

				this.IsUserEditable = false;
				this.IsString = true;
			}
		},
});

}
