{

const tagIndex = JPGCONST.EXIF.CUSTOM_TAG;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Non-standard Custom TAG", 
		defaults:{tag:tagIndex, type:2, length:0, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "Custom Tag (" + name + ")", bigEndian, tagIndex);

				this.IsUserEditable = true;
				this.IsString = true;
			}
		},
});

}
