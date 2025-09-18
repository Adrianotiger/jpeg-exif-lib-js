{
const tagIndex = JPGCONST.EXIF.MODEL;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Model", 
		defaults:{tag:tagIndex, type:2, length:0, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "Model (" + name + ")", bigEndian);
				
				this.IsString = true;
			}
		},
});
}