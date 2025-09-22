{

const tagIndex = JPGCONST.EXIF.INTEROP_INDEX;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Interoperability Index", 
		exif: 2.1,
		defaults:{tag:tagIndex, type:2, length:3, value:0x52393800},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "InteropIndex (" + name + ")", bigEndian, tagIndex);

				this.IsUserEditable = false;
				this.IsString = true;
			}
		},
});

}
