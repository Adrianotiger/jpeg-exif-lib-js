{
const tagIndex = JPGCONST.EXIF.MAKE;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Make", 
		exif: 2.0,
		defaults:{tag:tagIndex, type:2, length:0, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "Make (" + name + ")", bigEndian, tagIndex);
				
				this.IsString = true;
			}
		},
});
}