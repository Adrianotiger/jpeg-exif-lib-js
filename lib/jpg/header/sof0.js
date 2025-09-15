class JPGSOF0 extends JpgSection
{		
	constructor(buffer, offset)
	{
		super(buffer, offset, "SOF0");
		
		this.addAttribute("sectionId", 2);
		this.addAttribute("sectionSize", 2);
		this.addAttribute("precision", 1);
		
		this.addAttribute("imageHeight", 2);
		this.addAttribute("imageWidth", 2);
		this.addAttribute("components", 1);
		
		const comps = ["Y", "Cb", "Cr"];
		
		for(let j=0;j<this.getAttribute("components");j++)
		{
			this.addAttribute(comps[j] + "Id", 1);
			this.addAttribute(comps[j] + "Factor", 1);
			this.addAttribute(comps[j] + "Table", 1);
		}
	}
};