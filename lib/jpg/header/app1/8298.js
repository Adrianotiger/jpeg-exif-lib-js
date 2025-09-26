
{
const tagIndex = JPGCONST.EXIF.COPYRIGHT;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Copyright", 
		exif: 2.1,
		defaults:{tag:tagIndex, type:2, length:0, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "Copyright (" + name + ")", bigEndian, tagIndex);
				
				this.IsString = true;
			}
		},
});
}