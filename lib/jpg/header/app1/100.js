// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.IMAGE_WIDTH;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Image Width", 
		defaults:{tag:tagIndex, type:4, length:1, value:100},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "ImageWidth (" + name + ")", bigEndian, tagIndex);

				this.IsUserEditable = false;
				this.IsNumber = true;
			}

			toString()
			{
				return this.getValue()  + " px";
			}
		},
});

}