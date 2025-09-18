// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.ISOSPEED;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"ISO Speed Rating", 
		defaults:{tag:tagIndex, type:4, length:1, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "ISOSpeedRating (" + name + ")", bigEndian, tagIndex);

				this.IsUserEditable = false;
				this.IsNumber = true;
			}
		},
});

}