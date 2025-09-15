class JPGDQT extends JpgSection
{		
	constructor(buffer, offset)
	{
		super(buffer, offset, "DQT");
		
		this.addAttribute("sectionId", 2);
		this.addAttribute("sectionSize", 2);
		this.addAttribute("pqtq", 1, "Pq (8/16 bit) and Tq (table id)");
		
		this.addAttribute("values", 64);
	}
};