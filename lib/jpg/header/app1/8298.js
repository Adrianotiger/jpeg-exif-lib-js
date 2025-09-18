
{
const tagIndex = JPGCONST.EXIF.COPYRIGHT;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Copyright", 
		defaults:{tag:tagIndex, type:2, length:0, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "Copyright (" + name + ")", bigEndian);
				
				this.IsString = true;
			}
		},
});
}